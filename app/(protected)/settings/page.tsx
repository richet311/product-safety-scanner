'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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
      borderRadius: '10px', border: '1.5px solid #e2e8f0', overflow: 'hidden',
    }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '0 11px', minHeight: '42px',
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
              padding: '7px 15px', borderRadius: '20px',
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

export default function SettingsPage() {
  const [age, setAge] = useState('')

  // Canonical values always stored in kg / cm
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)

  // Display state — what the user sees/types
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
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setAge(data.age != null ? String(data.age) : '')
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      id: user.id,
      age: age ? Number(age) : null,
      weight_kg: weightKg != null ? parseFloat(weightKg.toFixed(2)) : null,
      height_cm: heightCm != null ? parseFloat(heightCm.toFixed(1)) : null,
      allergies,
      dietary_preferences: dietaryPrefs,
      health_conditions: healthConds,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div style={{ padding: '36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: '#94a3b8' }}>Loading profile…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '36px 28px', maxWidth: '640px', margin: '0 auto' }}>
      <style>{`
        .s-input {
          width: 100%;
          padding: 10px 13px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          font-family: inherit;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        .s-input:focus { border-color: #00C37A; box-shadow: 0 0 0 3px rgba(0,195,122,0.1); }
        .s-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          padding: 22px 22px 18px;
          margin-bottom: 18px;
        }
        .s-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .s-card-sub {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 16px;
          line-height: 1.5;
        }
        .s-field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 7px;
        }
        .s-unit-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
          align-self: center;
          flex-shrink: 0;
        }
        .save-btn {
          padding: 12px 28px;
          border-radius: 12px;
          border: none;
          background: #00C37A;
          color: #fff;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.1s;
        }
        .save-btn:hover:not(:disabled) {
          background: #00b36e;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(0,195,122,0.3);
        }
        .save-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '30px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>Settings</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'inherit' }}>Personalize your safety analysis with your health profile.</p>
      </div>

      <form onSubmit={handleSave}>
        {/* Biometrics */}
        <div className="s-card">
          <h2 className="s-card-title">📊 Biometrics</h2>
          <p className="s-card-sub">Used to personalize ingredient concern thresholds.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Age */}
            <div>
              <label className="s-field-label">Age</label>
              <input
                type="number"
                className="s-input"
                placeholder="28"
                value={age}
                onChange={e => setAge(e.target.value)}
                min={1} max={120}
                style={{ maxWidth: '160px' }}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="s-field-label">Weight</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', maxWidth: '320px' }}>
                <input
                  type="number"
                  className="s-input"
                  placeholder={weightUnit === 'kg' ? '70.0' : '154.3'}
                  value={weightDisplay}
                  onChange={e => handleWeightChange(e.target.value)}
                  step="0.1"
                  min={0}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <UnitToggle options={['kg', 'lbs']} value={weightUnit} onChange={changeWeightUnit} />
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="s-field-label">Height</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', maxWidth: heightUnit === 'ft' ? '400px' : '320px' }}>
                {heightUnit === 'ft' ? (
                  <>
                    <input
                      type="number"
                      className="s-input"
                      placeholder="5"
                      value={heightFt}
                      onChange={e => handleHeightChange(e.target.value, 'ft')}
                      min={0} max={8} step={1}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <span className="s-unit-label">ft</span>
                    <input
                      type="number"
                      className="s-input"
                      placeholder="10"
                      value={heightIn}
                      onChange={e => handleHeightChange(e.target.value, 'in')}
                      min={0} max={11} step={1}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <span className="s-unit-label">in</span>
                  </>
                ) : (
                  <input
                    type="number"
                    className="s-input"
                    placeholder={heightUnit === 'cm' ? '175' : '1.75'}
                    value={heightDisplay}
                    onChange={e => handleHeightChange(e.target.value, 'main')}
                    step={heightUnit === 'm' ? '0.01' : '1'}
                    min={0}
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

        {/* Allergies */}
        <div className="s-card">
          <h2 className="s-card-title">⚠️ Allergies &amp; Intolerances</h2>
          <p className="s-card-sub">These will be flagged whenever found in a scanned product.</p>
          <PillGroup options={ALLERGY_OPTIONS} selected={allergies} onChange={setAllergies} />
        </div>

        {/* Dietary */}
        <div className="s-card">
          <h2 className="s-card-title">🥗 Dietary Preferences</h2>
          <p className="s-card-sub">We&apos;ll factor these into ingredient ratings for your scans.</p>
          <PillGroup options={DIETARY_OPTIONS} selected={dietaryPrefs} onChange={setDietaryPrefs} />
        </div>

        {/* Conditions */}
        <div className="s-card">
          <h2 className="s-card-title">🏥 Health Conditions</h2>
          <p className="s-card-sub">Helps surface ingredients that may interact with your condition.</p>
          <PillGroup options={CONDITION_OPTIONS} selected={healthConds} onChange={setHealthConds} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
    </div>
  )
}
