'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteScan } from './actions'

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

function DeleteModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      onClick={onCancel}
      className="del-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .del-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .del-modal {
          background: #fff; border-radius: 28px;
          padding: 30px 26px 26px; max-width: 360px; width: 100%;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        @media (max-width: 640px) {
          .del-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .del-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(26px, env(safe-area-inset-bottom)) !important;
            animation: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div
        className="del-modal"
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Delete scan?
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          {productName
            ? <>This will permanently remove <strong style={{ color: '#0f172a' }}>{productName}</strong> from your scan history.</>
            : 'This will permanently remove this scan from your history.'}
          {' '}This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.13s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: 'none', background: '#ef4444',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.13s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function ScanCard({ scan }: { scan: Scan }) {
  const g = GRADE[scan.overall_grade]
  const concerns = scan.analysis?.ingredients?.filter(i => !i.safe).length ?? 0
  const date = new Date(scan.created_at)
  const [pending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  function handleConfirm() {
    setShowModal(false)
    startTransition(() => deleteScan(scan.id))
  }

  return (
    <>
      <div style={{ position: 'relative', opacity: pending ? 0.4 : 1, transition: 'opacity 0.2s' }}>
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
                paddingRight: '8px',
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
                {concerns > 0 ? (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: g.color, whiteSpace: 'nowrap' }}>
                    {concerns} concern{concerns !== 1 ? 's' : ''}
                  </span>
                ) : (scan.overall_grade === 'A' || scan.overall_grade === 'B') ? (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#00a868', whiteSpace: 'nowrap' }}>
                    No concerns
                  </span>
                ) : null}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '11.5px', color: '#cbd5e1' }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={pending}
          title="Delete scan"
          style={{
            position: 'absolute', bottom: 14, right: 14,
            width: 28, height: 28, borderRadius: '8px',
            border: '1px solid #f1f5f9',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#cbd5e1',
            transition: 'color 0.15s, border-color 0.15s, background 0.15s',
            padding: 0,
            zIndex: 1,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#ef4444'
            el.style.borderColor = 'rgba(239,68,68,0.25)'
            el.style.background = 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#cbd5e1'
            el.style.borderColor = '#f1f5f9'
            el.style.background = '#fff'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {showModal && (
        <DeleteModal
          productName={scan.product_name}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
