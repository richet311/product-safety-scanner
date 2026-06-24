'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deleteAccount } from './actions'

const ALLERGY_OPTIONS = [
  'Gluten / Wheat', 'Dairy / Lactose', 'Eggs', 'Peanuts',
  'Tree Nuts', 'Shellfish', 'Fish', 'Soy', 'Sesame', 'Corn',
]

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Halal', 'Kosher',
]

const CONDITION_OPTIONS = [
  'Diabetes', 'Heart Disease', 'High Blood Pressure',
  'Eczema / Skin Sensitivity', 'Asthma', 'Celiac Disease',
]

type WeightUnit = 'kg' | 'lbs'
type HeightUnit = 'cm' | 'm' | 'ft'

function computeAge(dob: string): number | null {
  if (!dob) return null
  const b = new Date(dob)
  if (isNaN(b.getTime())) return null
  const n = new Date()
  let age = n.getFullYear() - b.getFullYear()
  const m = n.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--
  return age >= 0 && age < 150 ? age : null
}

function kgToDisplay(kg: number, unit: WeightUnit): string {
  if (unit === 'lbs') return (kg * 2.20462).toFixed(1)
  return kg.toFixed(1)
}

function cmToDisplay(cm: number, unit: HeightUnit): { main: string; ft: string; inches: string } {
  if (unit === 'cm') return { main: String(Math.round(cm)), ft: '', inches: '' }
  if (unit === 'm') return { main: (cm / 100).toFixed(2), ft: '', inches: '' }
  const totalIn = cm / 2.54
  let ft = Math.floor(totalIn / 12)
  let inches = Math.round(totalIn % 12)
  if (inches === 12) { inches = 0; ft++ }
  return { main: '', ft: String(ft), inches: String(inches) }
}

function UnitToggle({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'flex', flexShrink: 0,
      borderRadius: '100px', border: '1.5px solid #e2e8f0', overflow: 'hidden',
    }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '0 12px', minHeight: '42px',
            background: opt === value ? '#00C37A' : '#fff',
            color: opt === value ? '#fff' : '#64748b',
            border: 'none',
            borderLeft: i > 0 ? '1.5px solid #e2e8f0' : 'none',
            fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.14s, color 0.14s',
            whiteSpace: 'nowrap',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function PillGroup({ options, selected, onChange }: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(opt: string) {
    onChange(selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt]
    )
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const on = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '8px 16px', borderRadius: '100px',
              border: `1.5px solid ${on ? '#00C37A' : '#e2e8f0'}`,
              background: on ? 'rgba(0,195,122,0.1)' : '#fff',
              color: on ? '#007a4d' : '#64748b',
              fontSize: '13px', fontWeight: on ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.13s ease', fontFamily: 'inherit',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function UsernameModal({
  newUsername,
  onConfirm,
  onCancel,
  verifying,
  error,
}: {
  newUsername: string
  onConfirm: (password: string) => void
  onCancel: () => void
  verifying: boolean
  error: string | null
}) {
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password) onConfirm(password)
  }

  return (
    <div
      onClick={verifying ? undefined : onCancel}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .modal-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .un-modal {
          background: #fff; border-radius: 28px;
          padding: 32px 28px 28px; max-width: 400px; width: 100%;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
          animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .s-modal-input {
          width: 100%; padding: 12px 14px;
          border-radius: 12px; border: 1.5px solid #e2e8f0;
          background: #fff; font-size: 15px; color: #0f172a;
          outline: none; font-family: inherit; box-sizing: border-box;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .s-modal-input:focus { border-color: #00C37A; box-shadow: 0 0 0 3px rgba(0,195,122,0.12); }
        @media (max-width: 640px) {
          .modal-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .un-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div
        className="un-modal"
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(0,195,122,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '18px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Confirm your password
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          Enter your current password to change your username to{' '}
          <strong style={{ color: '#0f172a' }}>@{newUsername}</strong>.
        </p>

        {error && (
          <div style={{
            marginBottom: '16px', padding: '10px 13px',
            borderRadius: '12px', background: '#fff1f2',
            border: '1px solid #fecdd3', color: '#be123c', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            className="s-modal-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            disabled={verifying}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={verifying}
              style={{
                flex: 1, padding: '12px', borderRadius: '100px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#475569', fontWeight: 600, fontSize: '14px',
                cursor: verifying ? 'not-allowed' : 'pointer',
                opacity: verifying ? 0.6 : 1, fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying || !password}
              style={{
                flex: 1, padding: '12px', borderRadius: '100px',
                border: 'none', background: '#00C37A',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                cursor: verifying || !password ? 'not-allowed' : 'pointer',
                opacity: verifying || !password ? 0.55 : 1, fontFamily: 'inherit',
              }}
            >
              {verifying ? 'Verifying…' : 'Confirm'}
            </button>
          </div>
        </form>

        <p style={{ margin: '16px 0 0', fontSize: '12.5px', color: '#94a3b8', textAlign: 'center' }}>
          Forgot your password?{' '}
          <a href="/login" style={{ color: '#00C37A', fontWeight: 700, textDecoration: 'none' }}>
            Reset it here
          </a>
        </p>
      </div>
    </div>
  )
}

function SaveConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      onClick={onCancel}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(15,23,42,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .modal-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        @media (max-width: 640px) {
          .modal-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .sc-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div
        className="sc-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '28px',
          padding: '30px 26px 26px', maxWidth: '340px', width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.16)',
          animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(0,195,122,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Save changes?
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          Your profile and health settings will be updated.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
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
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: 'none', background: '#00C37A',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#00b36e' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#00C37A' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteAccountModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  const [typed, setTyped] = useState('')
  const confirmed = typed.toUpperCase() === 'DELETE'

  return (
    <div
      onClick={deleting ? undefined : onCancel}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .modal-backdrop { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .da-modal {
          background: #fff; border-radius: 28px;
          padding: 32px 28px 28px; max-width: 400px; width: 100%;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
          animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .da-input {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 2px solid #fecdd3; background: #fff1f2;
          font-size: 15px; font-weight: 700; color: #be123c;
          outline: none; letter-spacing: 0.08em; font-family: inherit;
          box-sizing: border-box; text-align: center; transition: border-color 0.15s;
        }
        .da-input:focus { border-color: #ef4444; }
        .da-input::placeholder { font-weight: 400; letter-spacing: 0; color: #fda4af; }
        @media (max-width: 640px) {
          .modal-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .da-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>
      <div
        className="da-modal"
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '18px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Delete your account?
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          This will permanently delete your account, all your scans, and your health profile.{' '}
          <strong style={{ color: '#0f172a' }}>This cannot be undone.</strong>
        </p>

        <div style={{ marginBottom: '22px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Type DELETE to confirm
          </p>
          <input
            className="da-input"
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            disabled={deleting}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontWeight: 600, fontSize: '14px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1, fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmed ? onConfirm : undefined}
            disabled={!confirmed || deleting}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px',
              border: 'none',
              background: confirmed ? '#ef4444' : '#fca5a5',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: confirmed && !deleting ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'background 0.13s',
            }}
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [hasEmailAuth, setHasEmailAuth] = useState(false)

  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [usernameModalVerifying, setUsernameModalVerifying] = useState(false)
  const [usernameModalError, setUsernameModalError] = useState<string | null>(null)

  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null)
  const [totpQr, setTotpQr] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [totpEnrolling, setTotpEnrolling] = useState(false)
  const [totpVerifying, setTotpVerifying] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [totpSecretVisible, setTotpSecretVisible] = useState(false)
  const [totpMsg, setTotpMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)
  const [weightDisplay, setWeightDisplay] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [heightDisplay, setHeightDisplay] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')

  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [healthConds, setHealthConds] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()
  const supabase = createClient()

  const computedAge = computeAge(dob)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const meta = user.user_metadata ?? {}

      setUserEmail(user.email ?? '')
      setHasEmailAuth(
        user.identities?.some((i: { provider: string }) => i.provider === 'email') ?? false
      )
      setFirstName(meta.first_name ?? '')
      setLastName(meta.last_name ?? '')
      setUsername(meta.username ?? '')
      setDob(meta.date_of_birth ?? '')
      if (user.phone) setPhone(user.phone)

      const { data: mfaData } = await supabase.auth.mfa.listFactors()
      const verifiedTotp = mfaData?.totp?.find((f: { status: string }) => f.status === 'verified')
      if (verifiedTotp) { setTotpEnabled(true); setTotpFactorId(verifiedTotp.id) }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        if (data.first_name) setFirstName(data.first_name)
        if (data.last_name) setLastName(data.last_name)
        if (data.username) {
          setUsername(data.username)
          setOriginalUsername(data.username)
        }
        if (data.date_of_birth) setDob(data.date_of_birth)
        setAllergies(data.allergies ?? [])
        setDietaryPrefs(data.dietary_preferences ?? [])
        setHealthConds(data.health_conditions ?? [])
        if (data.weight_kg != null) {
          setWeightKg(data.weight_kg)
          setWeightDisplay(kgToDisplay(data.weight_kg, 'kg'))
        }
        if (data.height_cm != null) {
          setHeightCm(data.height_cm)
          const d = cmToDisplay(data.height_cm, 'cm')
          setHeightDisplay(d.main)
        }
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleWeightChange(val: string) {
    setWeightDisplay(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) {
      setWeightKg(weightUnit === 'kg' ? n : n / 2.20462)
    } else if (val === '') {
      setWeightKg(null)
    }
  }

  function handleHeightChange(val: string, field: 'main' | 'ft' | 'in') {
    if (heightUnit === 'ft') {
      const ft = field === 'ft' ? (parseFloat(val) || 0) : (parseFloat(heightFt) || 0)
      const ins = field === 'in' ? (parseFloat(val) || 0) : (parseFloat(heightIn) || 0)
      if (field === 'ft') setHeightFt(val)
      else setHeightIn(val)
      setHeightCm((ft * 12 + ins) * 2.54)
    } else {
      setHeightDisplay(val)
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) {
        setHeightCm(heightUnit === 'cm' ? n : n * 100)
      } else if (val === '') {
        setHeightCm(null)
      }
    }
  }

  function changeWeightUnit(newUnit: string) {
    const u = newUnit as WeightUnit
    if (weightKg != null) setWeightDisplay(kgToDisplay(weightKg, u))
    setWeightUnit(u)
  }

  function changeHeightUnit(newUnit: string) {
    const u = newUnit as HeightUnit
    if (heightCm != null) {
      const d = cmToDisplay(heightCm, u)
      setHeightDisplay(d.main)
      setHeightFt(d.ft)
      setHeightIn(d.inches)
    }
    setHeightUnit(u)
  }

  async function startTotpEnroll() {
    setTotpEnrolling(true)
    setTotpMsg(null)
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Surfelt',
      friendlyName: 'Authenticator',
    })
    setTotpEnrolling(false)
    if (error) {
      setTotpMsg({ type: 'error', text: error.message })
    } else {
      setTotpFactorId(data.id)
      setTotpQr(data.totp.qr_code)
      setTotpSecret(data.totp.secret)
    }
  }

  async function verifyTotp() {
    if (!totpFactorId) return
    setTotpVerifying(true)
    setTotpMsg(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totpFactorId, code: totpCode.trim() })
    setTotpVerifying(false)
    if (error) {
      setTotpMsg({ type: 'error', text: error.message })
    } else {
      setTotpEnabled(true)
      setTotpQr(null)
      setTotpSecret(null)
      setTotpCode('')
      setTotpMsg({ type: 'success', text: '2FA enabled! Your account is now protected.' })
    }
  }

  async function disableTotp() {
    if (!totpFactorId) return
    setUnenrolling(true)
    setTotpMsg(null)
    const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId })
    setUnenrolling(false)
    if (error) {
      setTotpMsg({ type: 'error', text: error.message })
    } else {
      setTotpEnabled(false)
      setTotpFactorId(null)
      setTotpMsg({ type: 'success', text: '2FA has been disabled.' })
    }
  }

  async function performSave() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      username: username || null,
      date_of_birth: dob || null,
      phone: phone || null,
      age: computeAge(dob),
      weight_kg: weightKg != null ? parseFloat(weightKg.toFixed(2)) : null,
      height_cm: heightCm != null ? parseFloat(heightCm.toFixed(1)) : null,
      allergies,
      dietary_preferences: dietaryPrefs,
      health_conditions: healthConds,
      updated_at: new Date().toISOString(),
    })

    setOriginalUsername(username)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (username && username !== originalUsername && hasEmailAuth) {
      setUsernameModalError(null)
      setShowUsernameModal(true)
      return
    }
    setShowSaveConfirm(true)
  }

  async function handleUsernameModalConfirm(password: string) {
    setUsernameModalVerifying(true)
    setUsernameModalError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password })
    setUsernameModalVerifying(false)
    if (error) {
      setUsernameModalError('Incorrect password. Please try again.')
      return
    }
    setShowUsernameModal(false)
    await performSave()
  }

  if (loading) {
    return (
      <div style={{ padding: '36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: '#94a3b8' }}>Loading profile…</p>
      </div>
    )
  }

  const initials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'

  return (
    <div style={{ padding: '28px 20px 60px', maxWidth: '680px', margin: '0 auto' }}>
      <style>{`
        .s-input {
          width: 100%; padding: 11px 13px;
          border-radius: 12px; border: 1.5px solid #e2e8f0;
          background: #fff; font-size: 14px; color: #0f172a;
          outline: none; font-family: inherit; box-sizing: border-box;
          -webkit-appearance: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .s-input:focus { border-color: #00C37A; box-shadow: 0 0 0 3px rgba(0,195,122,0.1); }
        .s-input:disabled { background: #f8fafc; color: #94a3b8; cursor: default; }
        .s-card {
          background: #fff; border-radius: 22px;
          border: 1px solid #eff3f8; padding: 0;
          margin-bottom: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .s-card-header {
          padding: 16px 22px 14px; border-bottom: 1px solid #f8fafc;
          display: flex; align-items: center; gap: 10px;
        }
        .s-card-body { padding: 20px 22px 22px; }
        .s-card-section-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: #00C37A;
        }
        .s-card-title {
          font-size: 15px; font-weight: 700; color: '#0f172a'; margin: 0;
        }
        .s-card-sub {
          font-size: 13px; color: #94a3b8; margin: 0 0 18px; line-height: 1.55;
        }
        .s-field-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: #64748b; margin-bottom: 7px;
        }
        .s-unit-label {
          font-size: 13px; font-weight: 600; color: #64748b;
          white-space: nowrap; align-self: center; flex-shrink: 0;
        }
        .save-btn {
          padding: 13px 36px; border-radius: 100px; border: none;
          background: #00C37A; color: #fff; font-size: 14.5px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .save-btn:hover:not(:disabled) {
          background: #00b36e; transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(0,195,122,0.3);
        }
        .save-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .sub-section { border-top: 1px solid #f1f5f9; padding-top: 22px; margin-top: 22px; }
        @media (max-width: 640px) {
          .save-btn { width: 100%; padding: 14px 0; }
          .modal-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .sc-modal {
            border-radius: 28px 28px 0 0 !important; max-width: 100% !important;
            padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
            animation: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '0 0 5px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          My Profile
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
          Your health profile personalizes every scan to flag ingredients that affect you.
        </p>
      </div>

      {/* Profile header card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '18px', padding: '20px 22px',
        background: 'linear-gradient(135deg, rgba(0,195,122,0.07) 0%, rgba(0,195,122,0.02) 70%, transparent 100%)',
        borderRadius: '22px', border: '1px solid rgba(0,195,122,0.18)',
        boxShadow: '0 4px 20px rgba(0,195,122,0.12), 0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00C37A 0%, #00a868 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '21px', fontWeight: 800, color: '#fff', flexShrink: 0,
          letterSpacing: '-0.5px', boxShadow: '0 4px 16px rgba(0,195,122,0.35)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '16px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Profile'}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {username ? `@${username} · ` : ''}{userEmail}
          </p>
        </div>
        {computedAge != null && (
          <div style={{
            flexShrink: 0, background: 'rgba(0,195,122,0.12)', borderRadius: '100px',
            padding: '6px 14px', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#007a4d', lineHeight: 1 }}>{computedAge}</p>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#00a868', textTransform: 'uppercase', letterSpacing: '0.05em' }}>yrs</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Personal Info */}
        <div className="s-card">
          <div className="s-card-header">
            <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(0,195,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p className="s-card-section-label" style={{ margin: '0 0 1px' }}>Personal Info</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Name, date of birth, and contact</p>
            </div>
          </div>
          <div className="s-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="s-field-label">First Name</label>
                  <input className="s-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="s-field-label">Last Name</label>
                  <input className="s-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="s-field-label">Date of Birth</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    className="s-input"
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ maxWidth: '200px' }}
                  />
                  {computedAge != null && (
                    <span style={{ fontSize: '12.5px', color: '#007a4d', fontWeight: 700, background: 'rgba(0,195,122,0.1)', borderRadius: '100px', padding: '5px 13px', flexShrink: 0 }}>
                      Age {computedAge}
                    </span>
                  )}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#cbd5e1' }}>
                  Your age is calculated automatically from your date of birth.
                </p>
              </div>

              <div>
                <label className="s-field-label">
                  Phone Number{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '11px', color: '#94a3b8' }}>
                    optional
                  </span>
                </label>
                <input
                  className="s-input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  style={{ maxWidth: '260px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="s-card">
          <div className="s-card-header">
            <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p className="s-card-section-label" style={{ margin: '0 0 1px', color: '#6366f1' }}>Username</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Your public @handle</p>
            </div>
          </div>
          <div className="s-card-body">
            <p className="s-card-sub">Changing your username requires password verification for security.</p>
            <label className="s-field-label">Username</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '280px', flex: 1 }}>
                <span style={{ fontSize: '15px', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>@</span>
                <input
                  className="s-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="janedoe"
                  style={{ flex: 1 }}
                />
              </div>
              {username && username !== originalUsername && (
                <span style={{
                  fontSize: '11px', color: '#d97706', fontWeight: 700,
                  background: 'rgba(245,158,11,0.1)', borderRadius: '100px',
                  padding: '5px 12px', flexShrink: 0,
                  border: '1px solid rgba(245,158,11,0.25)',
                }}>
                  🔒 Password required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Biometrics */}
        <div className="s-card">
          <div className="s-card-header">
            <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="s-card-section-label" style={{ margin: '0 0 1px', color: '#f97316' }}>Biometrics</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Personalizes ingredient thresholds</p>
            </div>
          </div>
          <div className="s-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="s-field-label">Weight</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', maxWidth: '320px' }}>
                  <input
                    type="number"
                    className="s-input"
                    placeholder={weightUnit === 'kg' ? '70.0' : '154.3'}
                    value={weightDisplay}
                    onChange={e => handleWeightChange(e.target.value)}
                    step="0.1" min={0}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <UnitToggle options={['kg', 'lbs']} value={weightUnit} onChange={changeWeightUnit} />
                </div>
              </div>

              <div>
                <label className="s-field-label">Height</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', maxWidth: heightUnit === 'ft' ? '400px' : '320px' }}>
                  {heightUnit === 'ft' ? (
                    <>
                      <input
                        type="number" className="s-input" placeholder="5"
                        value={heightFt} onChange={e => handleHeightChange(e.target.value, 'ft')}
                        min={0} max={8} step={1} style={{ flex: 1, minWidth: 0 }}
                      />
                      <span className="s-unit-label">ft</span>
                      <input
                        type="number" className="s-input" placeholder="10"
                        value={heightIn} onChange={e => handleHeightChange(e.target.value, 'in')}
                        min={0} max={11} step={1} style={{ flex: 1, minWidth: 0 }}
                      />
                      <span className="s-unit-label">in</span>
                    </>
                  ) : (
                    <input
                      type="number" className="s-input"
                      placeholder={heightUnit === 'cm' ? '175' : '1.75'}
                      value={heightDisplay} onChange={e => handleHeightChange(e.target.value, 'main')}
                      step={heightUnit === 'm' ? '0.01' : '1'} min={0}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  )}
                  <UnitToggle options={['cm', 'm', 'ft']} value={heightUnit} onChange={changeHeightUnit} />
                </div>
                {heightCm != null && heightCm > 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                    {heightUnit !== 'cm' && `${Math.round(heightCm)} cm`}
                    {heightUnit === 'cm' && `${(heightCm / 100).toFixed(2)} m`}
                    {heightUnit !== 'ft' && (() => {
                      const totalIn = heightCm / 2.54
                      let ft = Math.floor(totalIn / 12)
                      let ins = Math.round(totalIn % 12)
                      if (ins === 12) { ins = 0; ft++ }
                      return ` · ${ft}ft ${ins}in`
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Health Profile */}
        <div className="s-card">
          <div className="s-card-header">
            <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <p className="s-card-section-label" style={{ margin: '0 0 1px', color: '#ef4444' }}>Health Profile</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Allergies, diet & conditions</p>
            </div>
          </div>
          <div className="s-card-body">
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>⚠️ Allergies &amp; Intolerances</p>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#94a3b8' }}>These will be flagged whenever found in a scanned product.</p>
              <PillGroup options={ALLERGY_OPTIONS} selected={allergies} onChange={setAllergies} />
            </div>

            <div className="sub-section">
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>🥗 Dietary Preferences</p>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#94a3b8' }}>We&apos;ll factor these into ingredient ratings for your scans.</p>
              <PillGroup options={DIETARY_OPTIONS} selected={dietaryPrefs} onChange={setDietaryPrefs} />
            </div>

            <div className="sub-section">
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>🏥 Health Conditions</p>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#94a3b8' }}>Helps surface ingredients that may interact with your condition.</p>
              <PillGroup options={CONDITION_OPTIONS} selected={healthConds} onChange={setHealthConds} />
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="s-card">
          <div className="s-card-header">
            <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p className="s-card-section-label" style={{ margin: '0 0 1px', color: '#475569' }}>Security</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Two-factor authentication</p>
            </div>
            {totpEnabled && (
              <span style={{
                fontSize: '11px', fontWeight: 700,
                padding: '4px 12px', borderRadius: '100px',
                background: 'rgba(0,195,122,0.1)', color: '#007a4d',
                letterSpacing: '0.04em', flexShrink: 0,
              }}>
                ENABLED
              </span>
            )}
          </div>
          <div className="s-card-body">
            <p className="s-card-sub">
              {totpEnabled
                ? 'Your account is protected with an authenticator app.'
                : 'Add an extra layer of security. You\'ll need Google Authenticator or Authy.'}
            </p>

            {totpMsg && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.5,
                background: totpMsg.type === 'error' ? '#fff1f2' : 'rgba(0,195,122,0.08)',
                border: `1px solid ${totpMsg.type === 'error' ? '#fecdd3' : 'rgba(0,195,122,0.2)'}`,
                color: totpMsg.type === 'error' ? '#be123c' : '#007a4d',
              }}>
                {totpMsg.text}
              </div>
            )}

            {totpEnabled ? (
              <button
                type="button" onClick={disableTotp} disabled={unenrolling}
                style={{
                  padding: '10px 22px', borderRadius: '100px',
                  border: '1.5px solid #fecdd3', background: '#fff',
                  color: '#ef4444', fontWeight: 700, fontSize: '13.5px',
                  cursor: unenrolling ? 'not-allowed' : 'pointer',
                  opacity: unenrolling ? 0.6 : 1, fontFamily: 'inherit',
                  transition: 'background 0.13s',
                }}
                onMouseEnter={e => { if (!unenrolling) (e.currentTarget as HTMLButtonElement).style.background = '#fff1f2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
              >
                {unenrolling ? 'Disabling…' : 'Disable 2FA'}
              </button>
            ) : totpQr ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: '#f8fafc', borderRadius: '16px', padding: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                  border: '1px solid #e2e8f0',
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', textAlign: 'center', fontWeight: 600 }}>
                    Scan with Google Authenticator or Authy
                  </p>
                  <img src={totpQr} alt="QR code" style={{ width: 160, height: 160, display: 'block' }} />
                  {totpSecret && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Can&apos;t scan? Enter manually:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <code style={{
                          fontSize: '13px', fontFamily: 'monospace', letterSpacing: '0.15em',
                          color: totpSecretVisible ? '#0f172a' : '#94a3b8', fontWeight: 700, background: '#fff',
                          border: '1px solid #e2e8f0', borderRadius: '8px',
                          padding: '6px 12px', display: 'inline-block',
                          filter: totpSecretVisible ? 'none' : 'blur(4px)',
                          userSelect: totpSecretVisible ? 'text' : 'none',
                          transition: 'filter 0.2s',
                        }}>
                          {totpSecret.replace(/(.{4})/g, '$1 ').trim()}
                        </code>
                        <button
                          type="button"
                          onClick={() => setTotpSecretVisible(v => !v)}
                          title={totpSecretVisible ? 'Hide code' : 'Reveal code'}
                          style={{
                            background: 'none', border: 'none', padding: '4px',
                            cursor: 'pointer', color: '#94a3b8', display: 'flex',
                            alignItems: 'center', transition: 'color 0.14s', flexShrink: 0,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}
                        >
                          {totpSecretVisible ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="s-field-label">6-digit code from your app</label>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '280px' }}>
                    <input
                      className="s-input" type="text" inputMode="numeric" maxLength={6}
                      value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      style={{ flex: 1, letterSpacing: '0.25em', fontWeight: 700, fontSize: '18px' }}
                    />
                    <button
                      type="button" onClick={verifyTotp}
                      disabled={totpVerifying || totpCode.length < 6}
                      style={{
                        padding: '10px 18px', borderRadius: '100px', border: 'none',
                        background: '#00C37A', color: '#fff', fontWeight: 700, fontSize: '13px',
                        cursor: totpVerifying || totpCode.length < 6 ? 'not-allowed' : 'pointer',
                        opacity: totpVerifying || totpCode.length < 6 ? 0.55 : 1,
                        fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}
                    >
                      {totpVerifying ? 'Verifying…' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button" onClick={startTotpEnroll} disabled={totpEnrolling}
                style={{
                  padding: '11px 24px', borderRadius: '100px', border: 'none',
                  background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: totpEnrolling ? 'not-allowed' : 'pointer',
                  opacity: totpEnrolling ? 0.6 : 1, fontFamily: 'inherit',
                  transition: 'background 0.13s, transform 0.13s',
                }}
                onMouseEnter={e => { if (!totpEnrolling) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0f172a' }}
              >
                {totpEnrolling ? 'Loading…' : 'Enable 2FA'}
              </button>
            )}
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ fontSize: '14px', color: '#00C37A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <div style={{
        marginTop: '32px', borderRadius: '22px',
        border: '1.5px solid #fecdd3', background: '#fff',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 22px', background: '#fff1f2', borderBottom: '1.5px solid #fecdd3' }}>
          <p style={{ margin: 0, fontSize: '10.5px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Danger Zone
          </p>
        </div>
        <div style={{ padding: '18px 22px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#64748b', lineHeight: 1.55 }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {deleteError && (
            <div style={{
              marginBottom: '14px', padding: '10px 13px', borderRadius: '12px',
              background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: '13px',
            }}>
              {deleteError}
            </div>
          )}
          <button
            type="button"
            onClick={() => { setDeleteError(null); setShowDeleteModal(true) }}
            style={{
              padding: '10px 22px', borderRadius: '100px',
              border: '1.5px solid #fecdd3', background: '#fff',
              color: '#ef4444', fontWeight: 700, fontSize: '13.5px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.13s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = '#fff1f2'; el.style.borderColor = '#ef4444'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = '#fff'; el.style.borderColor = '#fecdd3'
            }}
          >
            Delete my account
          </button>
        </div>
      </div>

      {showSaveConfirm && (
        <SaveConfirmModal
          onConfirm={() => { setShowSaveConfirm(false); performSave() }}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}

      {showUsernameModal && (
        <UsernameModal
          newUsername={username}
          onConfirm={handleUsernameModalConfirm}
          onCancel={() => { setShowUsernameModal(false); setUsernameModalError(null) }}
          verifying={usernameModalVerifying}
          error={usernameModalError}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          deleting={deletePending}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            startDeleteTransition(async () => {
              try {
                await deleteAccount()
              } catch (err) {
                setShowDeleteModal(false)
                setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.')
              }
            })
          }}
        />
      )}
    </div>
  )
}
