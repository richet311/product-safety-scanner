'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

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
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function Sidebar({
  displayName,
  avatarUrl,
}: {
  displayName?: string
  avatarUrl?: string
}) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  return (
    <>
      <style>{`
        .sidebar {
          width: 224px;
          min-height: 100vh;
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          color: #64748b;
          transition: background 0.13s ease, color 0.13s ease;
          margin-bottom: 2px;
          font-family: inherit;
        }
        .sidebar-nav-item:hover { background: #f8fafc; color: #0f172a; }
        .sidebar-nav-item.active {
          background: rgba(0,195,122,0.1);
          color: #007a4d;
          font-weight: 600;
        }
        .sidebar-nav-item.active svg { stroke: #00C37A; }
        .sidebar-signout {
          width: 100%;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          background: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.13s ease, color 0.13s ease, border-color 0.13s ease;
          text-align: left;
          font-family: inherit;
        }
        .sidebar-signout:hover { background: #fff1f2; color: #ef4444; border-color: #fecdd3; }
        .sidebar-back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 500;
          color: #94a3b8;
          text-decoration: none;
          padding: 4px 2px;
          transition: color 0.13s ease;
          font-family: inherit;
        }
        .sidebar-back-link:hover { color: #475569; }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          z-index: 50;
          padding: 6px 0 max(env(safe-area-inset-bottom), 6px);
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

      {/* Desktop sidebar */}
      <nav className="sidebar">
        {/* Logo — links to landing page */}
        <div style={{ padding: '20px 16px 12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', color: '#0f172a', fontFamily: 'inherit' }}>
              Surf<span style={{ color: '#00C37A' }}>elt</span>
            </span>
          </Link>
          <div style={{ marginTop: '6px' }}>
            <Link href="/" className="sidebar-back-link">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to website
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f1f5f9', margin: '0 16px 10px' }} />

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

        <div style={{ padding: '12px 10px', borderTop: '1px solid #f1f5f9', position: 'relative' }} ref={dropdownRef}>
          {/* Dropdown menu — opens upward */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: '10px', right: '10px',
              background: '#fff', border: '1px solid #e9eef4', borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100,
              overflow: 'hidden', padding: '6px',
            }}>
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', borderRadius: '9px', textDecoration: 'none', color: '#0f172a', fontSize: '13.5px', fontWeight: 500, transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
                Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', borderRadius: '9px', textDecoration: 'none', color: '#0f172a', fontSize: '13.5px', fontWeight: 500, transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </Link>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', borderRadius: '9px', border: 'none', background: 'none', color: '#ef4444', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </form>
            </div>
          )}

          {/* Avatar trigger button */}
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
              padding: '7px 8px', borderRadius: '10px', border: 'none',
              background: dropdownOpen ? 'rgba(0,195,122,0.08)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.13s',
              textAlign: 'left',
            }}
            onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = '' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,195,122,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#007a4d', flexShrink: 0, fontFamily: 'inherit' }}>
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {displayName}
              </p>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'transform 0.18s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
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
        <Link href="/" className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>
      </nav>
    </>
  )
}
