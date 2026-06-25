'use client'
import { useState } from 'react'

export function ScanDetailImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'zoom-in' }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.52)', borderRadius: '7px',
          padding: '4px 9px', display: 'flex', alignItems: 'center', gap: '5px',
          color: '#fff', fontSize: '11px', fontWeight: 600, pointerEvents: 'none',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          Tap to enlarge
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)', border: 'none',
              color: '#fff', fontSize: '26px', lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: '14px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}
    </>
  )
}
