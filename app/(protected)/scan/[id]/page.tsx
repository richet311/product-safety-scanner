import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

type Ingredient = {
  name: string
  grade: 'A' | 'B' | 'C' | 'D'
  concern: string | null
  safe: boolean
}

type Scan = {
  id: string
  product_name: string | null
  image_url: string | null
  overall_grade: 'A' | 'B' | 'C' | 'D'
  analysis: { summary: string; ingredients: Ingredient[] }
  created_at: string
}

const GRADE = {
  A: { color: '#00C37A', bg: 'rgba(0,195,122,0.12)', text: '#007a4d', label: 'Very Safe', arc: 226 },
  B: { color: '#EAB308', bg: 'rgba(234,179,8,0.12)', text: '#854d0e', label: 'Generally Safe', arc: 170 },
  C: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', text: '#9a3412', label: 'Use Caution', arc: 113 },
  D: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '#7f1d1d', label: 'Potentially Harmful', arc: 57 },
} as const

function GradeDonut({ grade }: { grade: keyof typeof GRADE }) {
  const cfg = GRADE[grade]
  return (
    <div style={{ position: 'relative', width: 144, height: 144, margin: '0 auto' }}>
      <svg width="144" height="144" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r="48"
          fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round"
          strokeDasharray="226 76" transform="rotate(135, 60, 60)"
        />
        <circle
          cx="60" cy="60" r="48"
          fill="none" stroke={cfg.color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${cfg.arc} 302`} transform="rotate(135, 60, 60)"
        />
      </svg>
      <div style={{
        position: 'absolute', top: '46%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '38px', fontWeight: 800, color: cfg.color,
        lineHeight: 1, letterSpacing: '-1px',
      }}>
        {grade}
      </div>
    </div>
  )
}

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('scans')
    .select('id, product_name, image_url, overall_grade, analysis, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!data) notFound()

  const scan = data as Scan
  const cfg = GRADE[scan.overall_grade]
  const concerns = scan.analysis?.ingredients?.filter(i => !i.safe).length ?? 0
  const ingredientCount = scan.analysis?.ingredients?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .detail-wrap {
          max-width: 540px;
          margin: 0 auto;
          padding: 28px 16px 80px;
        }
        @media (min-width: 640px) {
          .detail-wrap { padding: 36px 24px 60px; }
        }
      `}</style>

      <div className="detail-wrap">
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#64748b', textDecoration: 'none', fontSize: '13.5px',
            fontWeight: 500, marginBottom: '24px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </Link>

        <div style={{
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', color: '#00C37A', textTransform: 'uppercase' }}>
              Surfelt Analysis
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
              {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {scan.image_url && (
            <div style={{ margin: '16px 22px 0', borderRadius: '16px', overflow: 'hidden' }}>
              <img
                src={scan.image_url}
                alt={scan.product_name ?? 'Product'}
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          <div style={{ padding: scan.image_url ? '20px 22px 4px' : '28px 22px 4px' }}>
            <GradeDonut grade={scan.overall_grade} />
          </div>

          <div style={{ textAlign: 'center', padding: '10px 22px 16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
              {scan.product_name ?? 'Unknown Product'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 10px', fontWeight: 500 }}>
              {concerns > 0 ? `${concerns} concern${concerns !== 1 ? 's' : ''} found` : 'No concerns found'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{
                padding: '4px 14px', borderRadius: '20px',
                background: cfg.bg, color: cfg.text,
                fontSize: '12px', fontWeight: 700,
              }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {scan.analysis?.summary && (
            <div style={{ margin: '0 22px 16px', padding: '13px 16px', borderRadius: '14px', background: '#f8fafc', fontSize: '13.5px', color: '#475569', lineHeight: 1.7 }}>
              {scan.analysis.summary}
            </div>
          )}

          <div style={{ height: 1, background: '#f1f5f9', margin: '0 22px 20px' }} />

          <div style={{ padding: '0 22px 28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Ingredients Detected
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scan.analysis?.ingredients?.map((ing, i) => {
                const ic = GRADE[ing.grade]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: ic.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 800, color: ic.color, flexShrink: 0,
                    }}>
                      {ing.grade}
                    </div>
                    <div style={{ flex: 1, paddingTop: '5px' }}>
                      <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: '#0f172a' }}>{ing.name}</p>
                      {ing.concern && (
                        <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>{ing.concern}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '0 22px 22px' }}>
            <Link
              href="/scanner"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #00C37A 0%, #00a868 100%)',
                color: '#fff', fontWeight: 700, fontSize: '14.5px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,195,122,0.28)',
              }}
            >
              Scan Another Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
