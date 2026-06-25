import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ScanCard } from './ScanCard'
import type { Scan } from './ScanCard'
import { ActivityChart } from './ActivityChart'
import { DailyUsage } from './DailyUsage'

const DEFAULT_DAILY_LIMIT = 20

function getGroup(created_at: string): string {
  const now = new Date()
  const date = new Date(created_at)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000)
  const monthStart = new Date(todayStart.getTime() - 29 * 86400000)

  if (date >= todayStart) return 'Today'
  if (date >= yesterdayStart) return 'Yesterday'
  if (date >= weekStart) return 'This Week'
  if (date >= monthStart) return 'This Month'
  return 'Older'
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']

const GRADE_META = {
  A: { color: '#00C37A', label: 'Very Safe' },
  B: { color: '#EAB308', label: 'Generally Safe' },
  C: { color: '#F97316', label: 'Use Caution' },
  D: { color: '#EF4444', label: 'Potentially Harmful' },
} as const

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch last 48 h of events so the client can filter by local "today" regardless of timezone offset
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()

  const [scansResult, profileResult, eventsResult] = await Promise.all([
    supabase
      .from('scans')
      .select('id, product_name, image_url, overall_grade, analysis, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('profiles')
      .select('daily_scan_limit')
      .eq('id', user.id)
      .single(),
    supabase
      .from('scan_events')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', twoDaysAgo),
  ])

  const scans: Scan[] = scansResult.data ?? []
  const scanEvents: { created_at: string }[] = eventsResult.data ?? []
  const dailyLimit = (profileResult.data as { daily_scan_limit?: number } | null)?.daily_scan_limit ?? DEFAULT_DAILY_LIMIT

  const gradeScore = { A: 4, B: 3, C: 2, D: 1 } as const
  const gradeLetters = ['A', 'B', 'C', 'D'] as const
  const avgGrade: 'A' | 'B' | 'C' | 'D' | null = scans.length > 0
    ? gradeLetters[4 - Math.round(scans.reduce((s, sc) => s + gradeScore[sc.overall_grade as keyof typeof gradeScore], 0) / scans.length)]
    : null
  const concernCount = scans.filter(s => s.overall_grade === 'C' || s.overall_grade === 'D').length

  // Insights: grade distribution
  const gradeCounts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const scan of scans) gradeCounts[scan.overall_grade]++

  // Insights: top flagged ingredients (new format uses concern_ingredients, legacy uses ingredients)
  const ingredientFreq: Record<string, { display: string; count: number }> = {}
  for (const scan of scans) {
    const concerns = scan.analysis?.concern_ingredients ?? scan.analysis?.ingredients?.filter(i => !i.safe) ?? []
    for (const ing of concerns) {
      const key = ing.name.toLowerCase().trim()
      if (!ingredientFreq[key]) ingredientFreq[key] = { display: ing.name, count: 0 }
      ingredientFreq[key].count++
    }
  }
  const topConcerns = Object.values(ingredientFreq)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)


  // Insights: overall safety score
  const safetyScore = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + (s.overall_grade === 'A' ? 100 : s.overall_grade === 'B' ? 75 : s.overall_grade === 'C' ? 40 : 10), 0) / scans.length)
    : null
  const scoreColor = safetyScore == null ? '#94a3b8'
    : safetyScore >= 80 ? '#00C37A'
    : safetyScore >= 60 ? '#EAB308'
    : safetyScore >= 35 ? '#F97316'
    : '#EF4444'

  // Group scans by time period
  const grouped: Record<string, Scan[]> = {}
  for (const scan of scans) {
    const g = getGroup(scan.created_at)
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(scan)
  }
  const groups = GROUP_ORDER.filter(g => grouped[g]?.length > 0)
  const todayScans = grouped['Today'] ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .dashboard-wrap {
          padding: 32px 20px 80px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .dashboard-wrap { padding: 40px 32px 60px; }
        }

        .new-scan-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 12px;
          background: #00C37A;
          color: #fff;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: background 0.13s ease, transform 0.13s ease, box-shadow 0.13s ease;
          font-family: inherit;
          flex-shrink: 0;
        }
        .new-scan-btn:hover {
          background: #00b36e;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,195,122,0.28);
        }

        .scan-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .scan-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 14px;
          }
        }

        .scan-card-img { height: 110px; }
        @media (min-width: 480px) { .scan-card-img { height: 120px; } }
        @media (min-width: 640px) { .scan-card-img { height: 150px; } }

        .scan-card-body { padding: 8px 10px 10px; }
        @media (min-width: 640px) { .scan-card-body { padding: 14px 16px 16px; } }

        .scan-card-name {
          margin: 0 0 5px;
          font-weight: 700;
          font-size: 12px;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 24px;
        }
        @media (min-width: 640px) { .scan-card-name { font-size: 14px; } }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        .group-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .group-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f1f5f9;
        }

        .dash-layout {
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }
        .dash-main { flex: 1; min-width: 0; }
        .dash-insights {
          width: 256px;
          flex-shrink: 0;
          position: sticky;
          top: 32px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .insight-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          padding: 18px 20px;
        }
        .insight-title {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0 0 14px;
        }
        @media (max-width: 1059px) {
          .dash-layout { flex-direction: column; }
          .dash-insights {
            width: 100%;
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .insight-card { flex: 1; min-width: 220px; }
        }
        @media (max-width: 600px) {
          .dash-insights { flex-direction: column; }
          .insight-card { min-width: 0; }
        }
      `}</style>

      <div className="dashboard-wrap">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '30px', fontWeight: 700, color: '#0f172a',
                margin: '0 0 14px', letterSpacing: '-0.3px', lineHeight: 1.2,
              }}>
                Your Scans
              </h1>
              <DailyUsage scanEvents={scanEvents} dailyLimit={dailyLimit} />
            </div>
            <Link href="/scanner" className="new-scan-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Scan
            </Link>
          </div>
        </div>

        {scans.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: '20px',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '18px',
              background: 'rgba(0,195,122,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: 700, fontSize: '18px', color: '#0f172a', margin: '0 0 6px',
            }}>
              No scans yet
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 28px', lineHeight: 1.6, fontFamily: 'inherit' }}>
              Scan any product to see ingredient safety analysis. Works for food, beverages, cleaning products, medications, cosmetics, supplements, and more.
            </p>
            <Link href="/scanner" className="new-scan-btn" style={{ padding: '11px 24px', fontSize: '14px' }}>
              Scan your first product
            </Link>
          </div>
        ) : (
          <div className="dash-layout">
            {/* Left: stats + scan list */}
            <div className="dash-main">
              <div className="stats-grid">
                {[
                  { label: 'Total Scans', value: String(scans.length), sub: 'products analyzed' },
                  {
                    label: 'Avg Safety Grade',
                    value: avgGrade ?? '—',
                    sub: avgGrade === 'A' ? 'Very Safe' : avgGrade === 'B' ? 'Generally Safe' : avgGrade === 'C' ? 'Use Caution' : avgGrade === 'D' ? 'Potentially Harmful' : '',
                    color: avgGrade === 'A' ? '#00C37A' : avgGrade === 'B' ? '#EAB308' : avgGrade === 'C' ? '#F97316' : '#EF4444',
                  },
                  {
                    label: 'Needs Attention',
                    value: concernCount === 0 ? '✓' : String(concernCount),
                    sub: concernCount === 0 ? 'all products safe' : `product${concernCount !== 1 ? 's' : ''} graded C or D`,
                    color: concernCount === 0 ? '#00C37A' : '#EF4444',
                  },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
                    padding: '16px 18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: 800, color: (stat as { color?: string }).color ?? '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {groups.map(group => (
                  <div key={group}>
                    <p className="group-label">
                      {group === 'Today'
                        ? todayScans.length > 0
                          ? `Today · ${todayScans.length} scan${todayScans.length !== 1 ? 's' : ''}`
                          : 'Today · No scans yet'
                        : `${group} · ${grouped[group].length} scan${grouped[group].length !== 1 ? 's' : ''}`}
                    </p>
                    <div className="scan-grid">
                      {grouped[group].map(scan => (
                        <ScanCard key={scan.id} scan={scan} />
                      ))}
                    </div>
                  </div>
                ))}

                {todayScans.length === 0 && (
                  <div>
                    <p className="group-label">Today · No scans yet</p>
                    <div style={{
                      padding: '24px', borderRadius: '16px',
                      background: '#fff', border: '1.5px dashed #e2e8f0',
                      textAlign: 'center',
                    }}>
                      <p style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#94a3b8' }}>
                        You haven&apos;t scanned anything today.
                      </p>
                      <Link href="/scanner" className="new-scan-btn" style={{ padding: '8px 18px', fontSize: '13px' }}>
                        Scan Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: insights panel */}
            <aside className="dash-insights">
              {/* Safety Score */}
              <div className="insight-card">
                <p className="insight-title">Safety Score</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: '-1px' }}>
                    {safetyScore}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: scoreColor, paddingBottom: '5px' }}>/ 100</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                  {safetyScore! >= 80 ? 'Your pantry looks great' : safetyScore! >= 60 ? 'A few items to watch' : 'Several products need attention'}
                </p>
              </div>

              {/* Grade Breakdown */}
              <div className="insight-card">
                <p className="insight-title">Grade Breakdown</p>
                {(['A', 'B', 'C', 'D'] as const).map(grade => {
                  const count = gradeCounts[grade]
                  const pct = scans.length > 0 ? (count / scans.length) * 100 : 0
                  const meta = GRADE_META[grade]
                  return (
                    <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ width: 16, fontSize: '12px', fontWeight: 800, color: count > 0 ? meta.color : '#cbd5e1' }}>{grade}</span>
                      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        {pct > 0 && (
                          <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: '99px' }} />
                        )}
                      </div>
                      <span style={{ width: 16, fontSize: '12px', fontWeight: 700, color: count > 0 ? '#0f172a' : '#e2e8f0', textAlign: 'right' }}>{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Top Flagged Ingredients */}
              <div className="insight-card">
                <p className="insight-title">Most Flagged</p>
                {topConcerns.length === 0 ? (
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#00a868', fontWeight: 600 }}>No concerns found</p>
                  </div>
                ) : (
                  topConcerns.map(({ display, count }, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '9px',
                      padding: '7px 0',
                      borderBottom: i < topConcerns.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '12px', color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {display}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {count}×
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Scan Activity — client component uses browser local time */}
              <ActivityChart scans={scans.map(s => ({ created_at: s.created_at, overall_grade: s.overall_grade }))} />
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
