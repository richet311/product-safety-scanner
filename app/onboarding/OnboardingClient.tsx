'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ALLERGY_OPTIONS = [
  'Gluten / Wheat', 'Dairy / Lactose', 'Eggs', 'Peanuts',
  'Tree Nuts', 'Shellfish', 'Fish', 'Soy', 'Sesame', 'Corn',
]
const DIETARY_OPTIONS = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Halal', 'Kosher']
const CONDITION_OPTIONS = [
  'Diabetes', 'Heart Disease', 'High Blood Pressure',
  'Eczema / Skin Sensitivity', 'Asthma', 'Celiac Disease',
]

type WeightUnit = 'lbs' | 'kg'
type HeightUnit = 'ft' | 'cm'

function PillGroup({ options, selected, onChange }: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const on = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)} style={{
            padding: '8px 15px', borderRadius: '20px',
            border: `1.5px solid ${on ? '#00C37A' : '#e2e8f0'}`,
            background: on ? 'rgba(0,195,122,0.1)' : '#fff',
            color: on ? '#007a4d' : '#64748b',
            fontSize: '13px', fontWeight: on ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.13s', fontFamily: 'inherit',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Field({ id, label, type, value, onChange, placeholder, required, max, min }: {
  id: string; label: string; type: string; value: string
  onChange: (v: string) => void; placeholder?: string
  required?: boolean; max?: string; min?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{
        fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: focused ? '#00C37A' : '#64748b',
        transition: 'color 0.2s',
      }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder} required={required} max={max} min={min}
        style={{
          width: '100%', padding: '13px 14px', borderRadius: '11px', outline: 'none',
          border: `1.5px solid ${focused ? '#00C37A' : '#e2e8f0'}`,
          background: focused ? '#f8fafc' : '#fff',
          fontSize: '16px', color: '#0f172a',
          transition: 'border-color 0.2s, background 0.2s',
          WebkitAppearance: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function UnitToggle({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', borderRadius: '10px', border: '1.5px solid #e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
      {options.map((opt, i) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: '0 13px', minHeight: '44px',
          background: opt === value ? '#00C37A' : '#fff',
          color: opt === value ? '#fff' : '#64748b',
          border: 'none', borderLeft: i > 0 ? '1.5px solid #e2e8f0' : 'none',
          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'background 0.14s, color 0.14s',
          whiteSpace: 'nowrap',
        }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

const TOTAL = 3

export default function OnboardingClient({
  userId, defaultFirstName, defaultLastName,
}: {
  userId: string; defaultFirstName: string; defaultLastName: string
}) {
  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd')

  // Step 1
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [dob, setDob] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs')
  const [weightDisplay, setWeightDisplay] = useState('')
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ft')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [heightDisplay, setHeightDisplay] = useState('')
  const [heightCm, setHeightCm] = useState<number | null>(null)

  // Step 3
  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [healthConds, setHealthConds] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  function goNext() {
    setDirection('fwd')
    setAnimKey(k => k + 1)
    setStep(s => s + 1)
  }
  function goBack() {
    setDirection('back')
    setAnimKey(k => k + 1)
    setStep(s => s - 1)
  }

  function handleWeightChange(val: string) {
    setWeightDisplay(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) setWeightKg(weightUnit === 'lbs' ? n / 2.20462 : n)
    else if (val === '') setWeightKg(null)
  }
  function changeWeightUnit(u: string) {
    const unit = u as WeightUnit
    if (weightKg != null) {
      setWeightDisplay(unit === 'lbs' ? (weightKg * 2.20462).toFixed(1) : weightKg.toFixed(1))
    }
    setWeightUnit(unit)
  }
  function handleHeightFtChange(val: string) {
    setHeightFt(val)
    const ft = parseFloat(val) || 0
    const ins = parseFloat(heightIn) || 0
    setHeightCm((ft * 12 + ins) * 2.54)
  }
  function handleHeightInChange(val: string) {
    setHeightIn(val)
    const ft = parseFloat(heightFt) || 0
    const ins = parseFloat(val) || 0
    setHeightCm((ft * 12 + ins) * 2.54)
  }
  function handleHeightCmChange(val: string) {
    setHeightDisplay(val)
    const n = parseFloat(val)
    setHeightCm(!isNaN(n) && n > 0 ? n : null)
  }
  function changeHeightUnit(u: string) {
    const unit = u as HeightUnit
    if (heightCm != null && heightCm > 0) {
      if (unit === 'ft') {
        const totalIn = heightCm / 2.54
        const ft = Math.floor(totalIn / 12)
        let ins = Math.round(totalIn % 12)
        if (ins === 12) { ins = 0 }
        setHeightFt(String(ft))
        setHeightIn(String(ins))
      } else {
        setHeightDisplay(String(Math.round(heightCm)))
      }
    }
    setHeightUnit(unit)
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)
    let age: number | null = null
    if (dob) {
      const b = new Date(dob)
      const t = new Date()
      age = t.getFullYear() - b.getFullYear()
      if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--
    }
    const { error: err } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName || null,
      last_name: lastName || null,
      username: username || null,
      date_of_birth: dob || null,
      phone: phone || null,
      age,
      weight_kg: weightKg != null ? parseFloat(weightKg.toFixed(2)) : null,
      height_cm: heightCm != null ? parseFloat(heightCm.toFixed(1)) : null,
      allergies,
      dietary_preferences: dietaryPrefs,
      health_conditions: healthConds,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (err) { setError(err.message) } else { window.location.href = '/dashboard' }
  }

  const dobAge = dob ? (() => {
    const b = new Date(dob)
    const t = new Date()
    let a = t.getFullYear() - b.getFullYear()
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
    return a
  })() : null

  const step1Valid = firstName.trim() && lastName.trim() && dob && username.trim() && (dobAge === null || dobAge >= 13)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '28px 16px 48px',
      background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,195,122,0.13) 0%, transparent 65%), #f8fafc',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @supports (min-height: 100dvh) { .ob-outer { min-height: 100dvh !important; } }
        @keyframes obFwd { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes obBack { from { opacity: 0; transform: translateX(-48px); } to { opacity: 1; transform: translateX(0); } }
        .ob-step-fwd { animation: obFwd 0.32s cubic-bezier(0.16,1,0.3,1) both; }
        .ob-step-back { animation: obBack 0.32s cubic-bezier(0.16,1,0.3,1) both; }
        .ob-btn-primary {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: #00C37A; color: #fff; font-weight: 700; font-size: 15px;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .ob-btn-primary:hover:not(:disabled) {
          background: #00b36e; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,195,122,0.32);
        }
        .ob-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ob-btn-back {
          width: 100%; padding: 13px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #475569; font-weight: 600; font-size: 15px;
          cursor: pointer; font-family: inherit;
          transition: background 0.13s, border-color 0.13s;
        }
        .ob-btn-back:hover { background: #f8fafc; border-color: #cbd5e1; }
        .ob-s-input {
          width: 100%; padding: 12px 13px; border-radius: 11px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 16px; color: #0f172a; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit; box-sizing: border-box; -webkit-appearance: none;
        }
        .ob-s-input:focus { border-color: #00C37A; box-shadow: 0 0 0 3px rgba(0,195,122,0.12); }
        .ob-label {
          display: block; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase; color: #64748b; margin-bottom: 7px;
        }
      `}</style>

      {/* Logo */}
      <a href="/" style={{ textDecoration: 'none', marginBottom: '24px', display: 'block' }}>
        <span style={{ fontWeight: 800, fontSize: '26px', letterSpacing: '-0.5px', color: '#0f172a' }}>
          Surf<span style={{ color: '#00C37A' }}>elt</span>
        </span>
      </a>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            height: '4px', width: '48px', borderRadius: '99px',
            background: s <= step ? '#00C37A' : '#e2e8f0',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      <div key={animKey} className={`ob-step-${direction}`} style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{
          background: '#fff', borderRadius: '22px',
          padding: '32px 24px 28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)',
        }}>
          {/* ── Step 1: Profile info ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: '22px', color: '#0f172a', margin: '0 0 5px' }}>
                  Let&apos;s get to know you
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                  Step 1 of 3 · Your basic info
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <Field id="ob-fn" label="First Name" type="text" value={firstName} onChange={setFirstName} placeholder="Jane" required />
                </div>
                <div style={{ flex: 1 }}>
                  <Field id="ob-ln" label="Last Name" type="text" value={lastName} onChange={setLastName} placeholder="Doe" required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Field id="ob-dob" label="Date of Birth" type="date" value={dob} onChange={setDob}
                  max={new Date().toISOString().split('T')[0]} required />
                {dobAge !== null && dobAge < 13 && (
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#be123c', fontWeight: 600 }}>
                    You must be at least 13 years old to use Surfelt.
                  </p>
                )}
              </div>

              <Field id="ob-user" label="Username" type="text" value={username} onChange={setUsername}
                placeholder="janedoe" required />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="ob-phone" style={{
                  fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: '#64748b',
                }}>
                  Phone <span style={{ fontWeight: 400, color: '#cbd5e1', textTransform: 'none', letterSpacing: 0 }}>optional</span>
                </label>
                <input
                  id="ob-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  style={{
                    width: '100%', padding: '13px 14px', borderRadius: '11px', outline: 'none',
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    fontSize: '16px', color: '#0f172a',
                    transition: 'border-color 0.2s',
                    WebkitAppearance: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00C37A' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
                />
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!step1Valid}
                className="ob-btn-primary"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Step 2: Biometrics ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: '22px', color: '#0f172a', margin: '0 0 5px' }}>
                  Your body stats
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                  Step 2 of 3 · Used to personalize ingredient thresholds
                </p>
              </div>

              {/* Weight */}
              <div>
                <label className="ob-label">Weight</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <input
                    className="ob-s-input"
                    type="number"
                    placeholder={weightUnit === 'lbs' ? '154' : '70.0'}
                    value={weightDisplay}
                    onChange={e => handleWeightChange(e.target.value)}
                    step="0.1" min="0"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <UnitToggle options={['lbs', 'kg']} value={weightUnit} onChange={changeWeightUnit} />
                </div>
                {weightKg != null && weightKg > 0 && (
                  <p style={{ margin: '5px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                    {weightUnit === 'lbs' ? `${weightKg.toFixed(1)} kg` : `${(weightKg * 2.20462).toFixed(1)} lbs`}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="ob-label">Height</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                  {heightUnit === 'ft' ? (
                    <>
                      <input
                        className="ob-s-input"
                        type="number" placeholder="5"
                        value={heightFt} onChange={e => handleHeightFtChange(e.target.value)}
                        min="0" max="8" step="1"
                        style={{ flex: 1, minWidth: '60px' }}
                      />
                      <span style={{ alignSelf: 'center', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>ft</span>
                      <input
                        className="ob-s-input"
                        type="number" placeholder="10"
                        value={heightIn} onChange={e => handleHeightInChange(e.target.value)}
                        min="0" max="11" step="1"
                        style={{ flex: 1, minWidth: '60px' }}
                      />
                      <span style={{ alignSelf: 'center', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>in</span>
                    </>
                  ) : (
                    <input
                      className="ob-s-input"
                      type="number" placeholder="175"
                      value={heightDisplay} onChange={e => handleHeightCmChange(e.target.value)}
                      min="0" step="1"
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  )}
                  <UnitToggle options={['ft', 'cm']} value={heightUnit} onChange={changeHeightUnit} />
                </div>
                {heightCm != null && heightCm > 0 && (
                  <p style={{ margin: '5px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                    {heightUnit === 'ft' ? `${Math.round(heightCm)} cm` : (() => {
                      const totalIn = heightCm / 2.54
                      const ft = Math.floor(totalIn / 12)
                      const ins = Math.round(totalIn % 12)
                      return `${ft}ft ${ins}in`
                    })()}
                  </p>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                These fields are optional — you can skip and update them in your profile later.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={goBack} className="ob-btn-back">Back</button>
                <button type="button" onClick={goNext} className="ob-btn-primary">Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Allergies & preferences ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: '22px', color: '#0f172a', margin: '0 0 5px' }}>
                  Allergies &amp; diet
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                  Step 3 of 3 · We&apos;ll flag these in every scan
                </p>
              </div>

              {error && (
                <div style={{
                  padding: '11px 14px', borderRadius: '10px',
                  background: '#fff1f2', border: '1px solid #fecdd3',
                  color: '#be123c', fontSize: '13px',
                }}>
                  {error}
                </div>
              )}

              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Allergies &amp; Intolerances</p>
                <PillGroup options={ALLERGY_OPTIONS} selected={allergies} onChange={setAllergies} />
              </div>

              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Dietary Preferences</p>
                <PillGroup options={DIETARY_OPTIONS} selected={dietaryPrefs} onChange={setDietaryPrefs} />
              </div>

              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Health Conditions</p>
                <PillGroup options={CONDITION_OPTIONS} selected={healthConds} onChange={setHealthConds} />
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                All optional — you can always update these in your profile.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={goBack} className="ob-btn-back" style={{ flex: '0 0 auto', width: 'auto', padding: '13px 20px' }}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="ob-btn-primary"
                >
                  {saving ? 'Setting up your account…' : 'Get started →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
