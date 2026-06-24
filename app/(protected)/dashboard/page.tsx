import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ScanCard } from './ScanCard'
import type { Scan } from './ScanCard'

const DAILY_LIMIT = Number(process.env.DAILY_SCAN_LIMIT ?? 20)

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [scansResult, usageResult] = await Promise.all([
    supabase
      .from('scans')
      .select('id, product_name, image_url, overall_grade, analysis, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('scan_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString()),
  ])

  const scans: Scan[] = scansResult.data ?? []
  const todayCount = usageResult.count ?? 0
  const remaining = DAILY_LIMIT - todayCount
  const atLimit = todayCount >= DAILY_LIMIT
  const usagePct = Math.min((todayCount / DAILY_LIMIT) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .dashboard-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 20px 80px;
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
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 520px) {
          .scan-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 820px) {
          .scan-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .usage-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
          background: ${atLimit
            ? 'linear-gradient(90deg, #f97316, #ef4444)'
            : 'linear-gradient(90deg, #00C37A, #00e896)'};
        }
      `}</style>

      <div className="dashboard-wrap">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '30px', fontWeight: 700, color: '#0f172a',
                margin: '0 0 14px', letterSpacing: '-0.3px', lineHeight: 1.2,
              }}>
                Your Scans
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '320px' }}>
                <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="usage-bar-fill" style={{ width: `${usagePct}%` }} />
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: atLimit ? '#ef4444' : '#94a3b8',
                  whiteSpace: 'nowrap', fontFamily: 'inherit',
                }}>
                  {atLimit ? 'Limit reached' : `${remaining} / ${DAILY_LIMIT} left today`}
                </span>
              </div>
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
              Scan your first product to see ingredient safety analysis here.
            </p>
            <Link href="/scanner" className="new-scan-btn" style={{ padding: '11px 24px', fontSize: '14px' }}>
              Scan your first product
            </Link>
          </div>
        ) : (
          <div className="scan-grid">
            {scans.map(scan => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
