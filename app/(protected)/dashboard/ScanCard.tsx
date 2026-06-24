'use client'

import Link from 'next/link'

type Ingredient = {
  name: string
  grade: 'A' | 'B' | 'C' | 'D'
  concern: string | null
  safe: boolean
}

export type Scan = {
  id: string
  product_name: string | null
  image_url: string | null
  overall_grade: 'A' | 'B' | 'C' | 'D'
  analysis: { summary: string; ingredients: Ingredient[] }
  created_at: string
}

const GRADE = {
  A: { bg: 'rgba(0,195,122,0.12)', text: '#007a4d', color: '#00C37A', label: 'Very Safe' },
  B: { bg: 'rgba(234,179,8,0.12)', text: '#854d0e', color: '#EAB308', label: 'Generally Safe' },
  C: { bg: 'rgba(249,115,22,0.12)', text: '#9a3412', color: '#F97316', label: 'Use Caution' },
  D: { bg: 'rgba(239,68,68,0.12)', text: '#7f1d1d', color: '#EF4444', label: 'Potentially Harmful' },
} as const

export function ScanCard({ scan }: { scan: Scan }) {
  const g = GRADE[scan.overall_grade]
  const concerns = scan.analysis?.ingredients?.filter(i => !i.safe).length ?? 0
  const date = new Date(scan.created_at)

  return (
    <Link href={`/scan/${scan.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'none'
          el.style.transform = 'none'
        }}
      >
        {scan.image_url ? (
          <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
            <img
              src={scan.image_url}
              alt={scan.product_name ?? 'Product'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
            }} />
            <div style={{
              position: 'absolute', top: 12, right: 12,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', fontWeight: 800, color: g.color,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              {scan.overall_grade}
            </div>
          </div>
        ) : (
          <div style={{
            height: '100px',
            background: g.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: g.color,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
              {scan.overall_grade}
            </div>
          </div>
        )}

        <div style={{ padding: '14px 16px 16px' }}>
          <p style={{
            margin: '0 0 4px', fontWeight: 700, fontSize: '15px', color: '#0f172a',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {scan.product_name ?? 'Unknown Product'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              padding: '2px 10px', borderRadius: '20px',
              background: g.bg, color: g.text,
            }}>
              {g.label}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {concerns > 0 ? `${concerns} concern${concerns !== 1 ? 's' : ''}` : 'No concerns'}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '11.5px', color: '#cbd5e1' }}>
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </Link>
  )
}
