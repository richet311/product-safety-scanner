'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'

async function signOut() {
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
              onClick={signOut}
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
  )
}

export function NavAuthMobile({
  avatarUrl,
  email,
}: {
  avatarUrl?: string
  email?: string
}) {
  return (
    <>
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
        onClick={signOut}
        className="block w-full text-left py-3 text-base font-semibold"
        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Sign out
      </button>
    </>
  )
}
