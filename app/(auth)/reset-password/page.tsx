'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

function Field({
  id, label, type, value, onChange, required,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '12px', fontWeight: 700,
          color: focused ? '#00C37A' : '#64748b',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        style={{
          width: '100%',
          background: focused ? '#f8fafc' : '#fff',
          border: `1.5px solid ${focused ? '#00C37A' : '#e2e8f0'}`,
          borderRadius: '10px',
          outline: 'none',
          padding: '13px 14px',
          fontSize: '16px',
          color: '#0f172a',
          transition: 'border-color 0.2s ease, background 0.2s ease',
          WebkitAppearance: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionReady(!!user)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => { window.location.href = '/dashboard' }, 2000)
    }
  }

  const _searchParams = searchParams

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,195,122,0.13) 0%, transparent 65%), #f8fafc',
    }}>
      <style>{`
        @supports (min-height: 100dvh) { div { min-height: 100dvh; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .btn-primary { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
        .btn-primary:hover:not(:disabled) {
          background: #00b36e !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,195,122,0.38);
        }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); box-shadow: none; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <a href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px', textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px', color: '#0f172a' }}>
            Surf<span style={{ color: '#00C37A' }}>elt</span>
          </span>
        </a>

        <div className="card-enter" style={{
          background: '#fff', borderRadius: '20px',
          padding: '36px 32px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)',
        }}>
          {sessionReady === null ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Loading…</p>
          ) : !sessionReady ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(251,191,36,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
                Link expired or invalid
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, marginBottom: '24px' }}>
                This password reset link has expired or already been used. Request a new one.
              </p>
              <a
                href="/login"
                style={{
                  display: 'inline-block', padding: '12px 28px',
                  borderRadius: '12px', background: '#00C37A',
                  color: '#fff', fontWeight: 700, fontSize: '14.5px',
                  textDecoration: 'none',
                }}
              >
                Back to sign in
              </a>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(0,195,122,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#00C37A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
                Password updated!
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65 }}>
                Redirecting you to your dashboard…
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontWeight: 700, fontSize: '21px', color: '#0f172a', margin: '0 0 5px' }}>
                  Set a new password
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                  Choose a strong password at least 8 characters long.
                </p>
              </div>

              {error && (
                <div style={{
                  marginBottom: '20px', padding: '11px 14px',
                  borderRadius: '10px', background: '#fff1f2',
                  border: '1px solid #fecdd3', color: '#be123c',
                  fontSize: '13px', lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field id="new-password" label="New Password" type="password" value={password} onChange={setPassword} required />
                <Field id="confirm-password" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    marginTop: '6px', width: '100%', padding: '13px',
                    borderRadius: '12px', border: 'none',
                    background: '#00C37A', color: '#fff',
                    fontWeight: 700, fontSize: '14.5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  {loading ? 'Updating password…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <a href="/login" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
          >
            ← Back to sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
