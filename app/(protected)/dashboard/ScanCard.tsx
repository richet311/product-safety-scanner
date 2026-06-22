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
  const ingredientCount = scan.analysis?.ingredients?.length ?? 0
  const date = new Date(scan.created_at)

  return (
    <Link href={`/scan/${scan.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          padding: '16px 18px',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'none'
          el.style.transform = 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '12px',
            background: g.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800,
            color: g.color,
            flexShrink: 0,
          }}>
            {scan.overall_grade}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scan.product_name ?? 'Unknown Product'}
              </p>
              <span style={{
                flexShrink: 0,
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: g.bg,
                color: g.text,
              }}>
                {g.label}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {scan.analysis?.summary}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}
              </span>
              <span style={{ color: '#e2e8f0', fontSize: '12px' }}>·</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {scan.image_url && (
            <img
              src={scan.image_url}
              alt=""
              style={{ width: 52, height: 52, borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
        </div>

        {(scan.analysis?.ingredients?.length ?? 0) > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {scan.analysis.ingredients.slice(0, 7).map((ing, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11.5px',
                  padding: '2px 9px',
                  borderRadius: '20px',
                  background: GRADE[ing.grade]?.bg ?? '#f3f4f6',
                  color: GRADE[ing.grade]?.text ?? '#374151',
                  fontWeight: 500,
                }}
              >
                {ing.name}
              </span>
            ))}
            {scan.analysis.ingredients.length > 7 && (
              <span style={{ fontSize: '11.5px', padding: '2px 9px', borderRadius: '20px', background: '#f1f5f9', color: '#64748b' }}>
                +{scan.analysis.ingredients.length - 7} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
