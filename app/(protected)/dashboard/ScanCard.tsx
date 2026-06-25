'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteScan } from './actions'

export type Scan = {
  id: string
  product_name: string | null
  image_url: string | null
  overall_grade: 'A' | 'B' | 'C' | 'D'
  analysis: {
    summary: string
    // new format
    concern_ingredients?: { safe: boolean; flagged?: boolean }[]
    // legacy format
    ingredients?: { safe: boolean; flagged?: boolean }[]
  }
  created_at: string
}

const GRADE = {
  A: { bg: 'rgba(0,195,122,0.12)', text: '#007a4d', color: '#00C37A', label: 'Very Safe' },
  B: { bg: 'rgba(234,179,8,0.12)', text: '#854d0e', color: '#EAB308', label: 'Generally Safe' },
  C: { bg: 'rgba(249,115,22,0.12)', text: '#9a3412', color: '#F97316', label: 'Use Caution' },
  D: { bg: 'rgba(239,68,68,0.12)', text: '#7f1d1d', color: '#EF4444', label: 'Potentially Harmful' },
} as const

function ImageModal({ url, name, onClose }: { url: string; name: string | null; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'imgBgIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes imgBgIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes imgScaleIn { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: 'min(88vw, 640px)',
          width: '100%',
          animation: 'imgScaleIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <img
          src={url}
          alt={name ?? 'Product'}
          style={{
            width: '100%', maxHeight: '82vh',
            borderRadius: '20px', display: 'block',
            objectFit: 'contain',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        />
        {name && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '40px 18px 18px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
            borderRadius: '0 0 20px 20px',
          }}>
            <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.4 }}>{name}</p>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: -12, right: -12,
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#0f172a',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

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
      <div className="del-modal" onClick={e => e.stopPropagation()}>
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
  const concerns =
    scan.analysis?.concern_ingredients?.length ??
    scan.analysis?.ingredients?.filter(i => !i.safe).length ??
    0
  const date = new Date(scan.created_at)
  const [pending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [showImage, setShowImage] = useState(false)

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
              border: '1px solid #eaeff6',
              overflow: 'hidden',
              transition: 'box-shadow 0.15s ease, transform 0.15s ease',
              cursor: 'pointer',
              boxShadow: '0 6px 28px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.09)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.boxShadow = '0 6px 28px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)'
              el.style.transform = 'none'
            }}
          >
            {scan.image_url ? (
              <div className="scan-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                  src={scan.image_url}
                  alt={scan.product_name ?? 'Product'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
                }} />
                {/* Grade badge — top right */}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 800, color: g.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {scan.overall_grade}
                </div>
                {/* Expand button — top left */}
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setShowImage(true) }}
                  title="View full image"
                  style={{
                    position: 'absolute', top: 10, left: 10,
                    width: 28, height: 28, borderRadius: '8px',
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#334155', padding: 0,
                    transition: 'opacity 0.13s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="scan-card-img" style={{
                background: g.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 800, color: g.color,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                  {scan.overall_grade}
                </div>
              </div>
            )}

            <div className="scan-card-body">
              <p className="scan-card-name">
                {scan.product_name ?? 'Unknown Product'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 9px', borderRadius: '20px',
                  background: g.bg, color: g.text,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {g.label}
                </span>
                {concerns > 0 ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: g.color, whiteSpace: 'nowrap' }}>
                    {concerns} concern{concerns !== 1 ? 's' : ''}
                  </span>
                ) : (scan.overall_grade === 'A' || scan.overall_grade === 'B') ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00a868', whiteSpace: 'nowrap' }}>
                    No concerns
                  </span>
                ) : null}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '10.5px', color: '#cbd5e1' }}>
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
            position: 'absolute', bottom: 12, right: 12,
            width: 28, height: 28,
            border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#cbd5e1',
            transition: 'color 0.15s',
            padding: 0, zIndex: 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1' }}
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
      {showImage && scan.image_url && (
        <ImageModal
          url={scan.image_url}
          name={scan.product_name}
          onClose={() => setShowImage(false)}
        />
      )}
    </>
  )
}
