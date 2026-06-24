'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/scanner',
    label: 'New Scan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'My Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

function SignOutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [signing, setSigning] = useState(false)

  async function handleConfirm() {
    setSigning(true)
    onConfirm()
  }

  return (
    <div
      onClick={signing ? undefined : onCancel}
      className="so-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'soFadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes soFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes soSlideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes soSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .so-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .so-modal {
          background: #fff; border-radius: 28px;
          padding: 30px 26px 26px; max-width: 340px; width: 100%;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          animation: soSlideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        @media (max-width: 640px) {
          .so-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .so-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: soSheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div className="so-modal" onClick={e => e.stopPropagation()}>
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
          You'll be taken back to the home page and will need to sign in again.
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
    </div>
  )
}

export default function Sidebar({
  displayName,
  avatarUrl,
}: {
  displayName?: string
  avatarUrl?: string
}) {
  const pathname = usePathname()
  const [showSignOut, setShowSignOut] = useState(false)
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <style>{`
        .sidebar {
          width: 220px;
          min-height: 100vh;
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          background: #f0fdf9;
          border-right: 1.5px solid #bbf7d0;
          box-shadow: 2px 0 20px rgba(0,195,122,0.1);
          display: flex;
          flex-direction: column;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 13px;
          border-radius: 11px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          color: #475569;
          transition: background 0.13s ease, color 0.13s ease;
          margin-bottom: 3px;
          font-family: inherit;
        }
        .sidebar-nav-item:hover { background: rgba(0,195,122,0.08); color: #0f172a; }
        .sidebar-nav-item.active {
          background: rgba(0,195,122,0.15);
          color: #007a4d;
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0,195,122,0.15);
        }
        .sidebar-nav-item.active svg { stroke: #00C37A; }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          z-index: 50;
          padding: 6px 0 max(env(safe-area-inset-bottom), 6px);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.07);
        }
        .mobile-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 8px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 500;
          color: #94a3b8;
          transition: color 0.13s ease;
          font-family: inherit;
        }
        .mobile-nav-item.active { color: #00C37A; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-nav { display: flex; }
        }
      `}</style>

      {showSignOut && (
        <SignOutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOut(false)}
        />
      )}

      {/* Desktop sidebar */}
      <nav className="sidebar">
        {/* Logo */}
        <div style={{ padding: '22px 16px 14px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span style={{ fontWeight: 800, fontSize: '21px', letterSpacing: '-0.5px', color: '#0f172a', fontFamily: 'inherit' }}>
              Surf<span style={{ color: '#00C37A' }}>elt</span>
            </span>
          </Link>
        </div>

        <div style={{ height: '1px', background: '#e2f5ec', margin: '0 16px 10px' }} />

        <div style={{ flex: 1, padding: '2px 10px 0' }}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item${pathname === item.href ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* User row + sign out */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid #e2f5ec' }}>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 10px', borderRadius: '10px',
            marginBottom: '8px',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,195,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#007a4d', flexShrink: 0 }}>
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {displayName}
            </p>
          </div>

          {/* Sign out button */}
          <button
            type="button"
            onClick={() => setShowSignOut(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 10px', borderRadius: '10px',
              border: '1px solid #fecdd3', background: '#fff1f2',
              color: '#ef4444', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.13s, border-color 0.13s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fff1f2'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#fecdd3'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <Link href="/" className="mobile-nav-item">
          <span style={{ color: '#94a3b8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          Home
        </Link>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item${pathname === item.href ? ' active' : ''}`}
          >
            <span style={{ color: pathname === item.href ? '#00C37A' : '#94a3b8' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowSignOut(true)}
          className="mobile-nav-item"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </nav>
    </>
  )
}
