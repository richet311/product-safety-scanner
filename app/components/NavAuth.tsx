'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

function SignOutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [signing, setSigning] = useState(false)

  async function handleConfirm() {
    setSigning(true)
    onConfirm()
  }

  return createPortal(
    <div
      onClick={signing ? undefined : onCancel}
      className="so-nav-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'soNavFadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes soNavFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes soNavSlideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes soNavSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .so-nav-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .so-nav-modal {
          background: #fff; border-radius: 28px;
          padding: 30px 26px 26px; max-width: 340px; width: 100%;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          animation: soNavSlideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        @media (max-width: 640px) {
          .so-nav-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .so-nav-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: soNavSheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div className="so-nav-modal" onClick={e => e.stopPropagation()}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Sign out?
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          You&apos;ll be taken back to the home page and will need to sign in again.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={signing}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={signing}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: 'none', background: '#ef4444',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: signing ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: signing ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!signing) (e.currentTarget as HTMLButtonElement).style.background = '#dc2626' }}
            onMouseLeave={e => { if (!signing) (e.currentTarget as HTMLButtonElement).style.background = '#ef4444' }}
          >
            {signing ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

async function doSignOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}

export function NavAuthDesktop({
  avatarUrl,
  email,
}: {
  avatarUrl?: string
  email?: string
}) {
  const [open, setOpen] = useState(false)
  const [showSignOut, setShowSignOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initial = email?.[0]?.toUpperCase() ?? 'U'

  return (
    <>
      {showSignOut && (
        <SignOutModal
          onConfirm={doSignOut}
          onCancel={() => setShowSignOut(false)}
        />
      )}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `2px solid ${open ? '#00C37A' : '#e2e8f0'}`,
            overflow: 'hidden', cursor: 'pointer',
            background: '#f1f5f9', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.15s ease',
          }}
          aria-label="Open profile menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{initial}</span>
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 210,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: '6px',
            zIndex: 200,
          }}>
            {email && (
              <div style={{
                padding: '8px 12px 10px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '4px',
              }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>Signed in as</div>
                <div style={{
                  fontSize: '13px', color: '#0f172a', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{email}</div>
              </div>
            )}
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Settings', href: '/settings' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  display: 'block', padding: '9px 12px', borderRadius: '10px',
                  fontSize: '13.5px', fontWeight: 500, color: '#334155',
                  textDecoration: 'none', transition: 'background 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {label}
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setOpen(false); setShowSignOut(true) }}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '10px',
                  fontSize: '13.5px', fontWeight: 500, color: '#ef4444',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function NavAuthMobile({
  avatarUrl,
  email,
}: {
  avatarUrl?: string
  email?: string
}) {
  const [showSignOut, setShowSignOut] = useState(false)

  return (
    <>
      {showSignOut && (
        <SignOutModal
          onConfirm={doSignOut}
          onCancel={() => setShowSignOut(false)}
        />
      )}
      {email && (
        <div style={{
          padding: '10px 0 12px',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '4px',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Signed in as</div>
          <div style={{
            fontSize: '13px', color: '#0f172a', fontWeight: 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{email}</div>
        </div>
      )}
      <a href="/dashboard" className="block py-3 text-base font-semibold text-gray-700 hover:text-gray-900 border-b border-gray-100">
        Dashboard
      </a>
      <a href="/settings" className="block py-3 text-base font-semibold text-gray-700 hover:text-gray-900 border-b border-gray-100">
        Settings
      </a>
      <button
        type="button"
        onClick={() => setShowSignOut(true)}
        className="block w-full text-left py-3 text-base font-semibold"
        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Sign out
      </button>
    </>
  )
}
