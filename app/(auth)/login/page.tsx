'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function Field({
  id, label, type, value, onChange, required, minLength,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  minLength?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: focused ? '#00C37A' : '#64748b',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
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
        minLength={minLength}
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

function LoginPageInner() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'reset-sent' | 'mfa'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  )
  const urlMessage = searchParams.get('message')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaVerifying, setMfaVerifying] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?intent=${mode}` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailExists(false)
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { first_name: firstName, last_name: lastName, username, date_of_birth: dob },
        },
      })
      if (error) {
        setError(error.message)
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setEmailExists(true)
      } else {
        setConfirmed(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
          const { data: factors } = await supabase.auth.mfa.listFactors()
          const totp = factors?.totp?.[0]
          if (totp) { setMfaFactorId(totp.id); setMode('mfa') }
        } else {
          window.location.href = '/dashboard'
        }
      }
    }
    setLoading(false)
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault()
    setMfaVerifying(true)
    setError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode.trim() })
    setMfaVerifying(false)
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMode('reset-sent')
    }
  }

  function switchMode() {
    setMode(m => (m === 'signin' || m === 'reset' || m === 'reset-sent') ? 'signup' : 'signin')
    setError(null)
    setConfirmed(false)
    setEmailExists(false)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setUsername('')
    setDob('')
  }

  function switchToSignIn() {
    setMode('signin')
    setError(null)
    setConfirmed(false)
    setEmailExists(false)
    setPassword('')
    setFirstName('')
    setLastName('')
    setUsername('')
    setDob('')
  }

  const viewKey = confirmed ? 'confirmed' : emailExists ? 'email-exists' : mode

  return (
    <div className="login-outer" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,195,122,0.13) 0%, transparent 65%), #f8fafc',
    }}>
      <style>{`
        @supports (min-height: 100dvh) {
          .login-outer { min-height: 100dvh !important; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .view-enter { animation: fadeSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .btn-primary {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-primary:hover:not(:disabled) {
          background: #00b36e !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,195,122,0.38);
        }
        .btn-primary:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: none;
        }

        .btn-google {
          transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-google:hover:not(:disabled) {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
        }
        .btn-google:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: none;
        }

        .switch-btn {
          background: none;
          border: none;
          padding: 6px 4px;
          margin: -6px -4px;
          color: #00C37A;
          font-weight: 700;
          cursor: pointer;
          font-size: inherit;
          transition: opacity 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          display: inline-block;
          min-height: 44px;
          vertical-align: middle;
        }
        .switch-btn:hover { opacity: 0.7; }

        .back-link {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.15s ease;
          display: inline-block;
          padding: 8px 0;
        }
        .back-link:hover { color: #475569; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px', textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px', color: '#0f172a' }}>
            Surf<span style={{ color: '#00C37A' }}>elt</span>
          </span>
        </a>

        {/* Card */}
        <div className="card-enter" style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '36px 32px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)',
        }}>

          {urlMessage === 'google_existing' && (
            <div style={{
              marginBottom: '16px', padding: '11px 14px',
              borderRadius: '12px', background: '#fff1f2',
              border: '1px solid #fecdd3', color: '#be123c',
              fontSize: '13px', lineHeight: 1.5,
            }}>
              A Surfelt account already exists with this Google address. Sign in instead.
            </div>
          )}
          <div key={viewKey} className="view-enter">
            {mode === 'mfa' ? (
              /* ── MFA challenge ── */
              <div>
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(0,195,122,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </div>
                  <h1 style={{ fontWeight: 700, fontSize: '21px', color: '#0f172a', margin: '0 0 5px' }}>
                    Two-factor authentication
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                    Open your authenticator app and enter the 6-digit code.
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

                <form onSubmit={handleMfa} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Authentication Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoFocus
                      style={{
                        width: '100%', padding: '14px',
                        border: '1.5px solid #e2e8f0', borderRadius: '10px',
                        fontSize: '24px', fontWeight: 800, letterSpacing: '0.3em',
                        textAlign: 'center', outline: 'none', color: '#0f172a',
                        background: '#fff', boxSizing: 'border-box',
                        WebkitAppearance: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#00C37A' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={mfaVerifying || mfaCode.length < 6}
                    className="btn-primary"
                    style={{
                      width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                      background: '#00C37A', color: '#fff', fontWeight: 700, fontSize: '14.5px',
                      cursor: mfaVerifying || mfaCode.length < 6 ? 'not-allowed' : 'pointer',
                      opacity: mfaVerifying || mfaCode.length < 6 ? 0.65 : 1,
                    }}
                  >
                    {mfaVerifying ? 'Verifying…' : 'Verify'}
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#94a3b8' }}>
                  <button type="button" onClick={switchToSignIn} className="switch-btn" style={{ fontSize: '13px', color: '#94a3b8' }}>
                    ← Back to sign in
                  </button>
                </p>
              </div>
            ) : mode === 'reset' ? (
              /* ── Forgot password ── */
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={switchToSignIn}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      marginBottom: '16px', fontFamily: 'inherit',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to sign in
                  </button>
                  <h1 style={{ fontWeight: 700, fontSize: '21px', color: '#0f172a', margin: '0 0 5px' }}>
                    Reset your password
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                    Enter your email and we&apos;ll send you a reset link.
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

                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Field id="reset-email" label="Email" type="email" value={email} onChange={setEmail} required />
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
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </div>
            ) : mode === 'reset-sent' ? (
              /* ── Reset email sent ── */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(0,195,122,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#00C37A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="#00C37A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
                  Check your email
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
                  We sent a password reset link to<br />
                  <strong style={{ color: '#0f172a' }}>{email}</strong>
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                  Didn&apos;t get it? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="switch-btn"
                    style={{ fontSize: '13px' }}
                  >
                    try again
                  </button>
                  .
                </p>
                <button type="button" onClick={switchToSignIn} className="switch-btn" style={{ fontSize: '14px' }}>
                  ← Back to sign in
                </button>
              </div>
            ) : emailExists ? (
              /* ── Email already registered ── */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: 'rgba(251,191,36,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
                  Email already registered
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, marginBottom: '24px' }}>
                  <strong style={{ color: '#0f172a' }}>{email}</strong> already has an account.<br />
                  Log in instead, or use a different email.
                </p>
                <button
                  type="button"
                  onClick={switchToSignIn}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#00C37A',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  Log in to this account
                </button>
                <button type="button" onClick={() => { setEmailExists(false); setEmail(''); setPassword('') }} className="switch-btn" style={{ fontSize: '14px' }}>
                  Use a different email
                </button>
              </div>
            ) : confirmed ? (
              /* ── Confirmation ── */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: 'rgba(0,195,122,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#00C37A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
                  Check your email
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
                  We sent a confirmation link to<br />
                  <strong style={{ color: '#0f172a' }}>{email}</strong>
                </p>
                <button type="button" onClick={switchMode} className="switch-btn" style={{ fontSize: '14px' }}>
                  ← Back to sign in
                </button>
              </div>
            ) : (
              /* ── Auth form ── */
              <>
                <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                  <h1 style={{ fontWeight: 700, fontSize: '21px', color: '#0f172a', margin: '0 0 5px' }}>
                    {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                    {mode === 'signin'
                      ? 'Sign in to your Surfelt account'
                      : 'Start scanning products for ingredient safety'}
                  </p>
                </div>

                {error && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#be123c',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                  {mode === 'signup' && (
                    <>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <Field id="firstName" label="First Name" type="text" value={firstName} onChange={setFirstName} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Field id="lastName" label="Last Name" type="text" value={lastName} onChange={setLastName} required />
                        </div>
                      </div>
                      <Field id="username" label="Username" type="text" value={username} onChange={setUsername} required />
                      <Field id="dob" label="Date of Birth" type="date" value={dob} onChange={setDob} required />
                    </>
                  )}
                  <Field id="email" label="Email" type="email" value={email} onChange={setEmail} required />
                  <div>
                    <Field id="password" label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
                    {mode === 'signin' && (
                      <div style={{ textAlign: 'right', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => { setError(null); setMode('reset') }}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            color: '#94a3b8', fontSize: '12.5px', cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#00C37A' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      marginTop: '18px',
                      width: '100%',
                      padding: '13px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#00C37A',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14.5px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.65 : 1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {loading
                      ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                      : (mode === 'signup' ? 'Create account' : 'Sign in')}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                  <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="btn-google"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#fff',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                {/* Mode toggle */}
                <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: '#94a3b8' }}>
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={switchMode} className="switch-btn">
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Back */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <a href="/" className="back-link">← Back to home</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
