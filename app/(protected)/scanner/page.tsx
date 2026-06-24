'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

const BarcodeCamera = dynamic(() => import('./BarcodeCamera'), { ssr: false })
const CameraCapture = dynamic(() => import('./CameraCapture'), { ssr: false })

type Tab = 'barcode' | 'label'
type ExtractState =
  | { status: 'idle' }
  | { status: 'loading'; message: string; step?: number; totalSteps?: number }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

type IngredientResult = {
  name: string
  grade: 'A' | 'B' | 'C' | 'D'
  concern: string | null
  safe: boolean
  flagged?: boolean
}
type AnalysisResult = {
  overall_grade: 'A' | 'B' | 'C' | 'D'
  summary: string
  ingredients: IngredientResult[]
  user_alerts?: string[]
}

const GRADE_CFG = {
  A: { color: '#00C37A', bg: 'rgba(0,195,122,0.12)', label: 'Very Safe' },
  B: { color: '#EAB308', bg: 'rgba(234,179,8,0.12)', label: 'Generally Safe' },
  C: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'Use Caution' },
  D: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Potentially Harmful' },
} as const

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'barcode',
    label: 'Barcode',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9V6a1 1 0 0 1 1-1h3M15 5h3a1 1 0 0 1 1 1v3M21 15v3a1 1 0 0 1-1 1h-3M9 19H6a1 1 0 0 1-1-1v-3"/>
        <line x1="7" y1="9" x2="7" y2="15"/>
        <line x1="10" y1="9" x2="10" y2="15"/>
        <line x1="14" y1="9" x2="14" y2="15"/>
        <line x1="17" y1="9" x2="17" y2="15"/>
      </svg>
    ),
  },
  {
    id: 'label',
    label: 'Photo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
]

export default function ScannerPage() {
  const [tab, setTab] = useState<Tab>('barcode')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extractState, setExtractState] = useState<ExtractState>({ status: 'idle' })
  const [cameraUnsupported, setCameraUnsupported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [inlineResult, setInlineResult] = useState<{ analysis: AnalysisResult; productName: string; saveError?: string } | null>(null)
  const [captureMode, setCaptureMode] = useState<'barcode' | 'label' | null>(null)
  const captureModeRef = useRef<'barcode' | 'label' | null>(null)
  captureModeRef.current = captureMode

  const barcodeUploadRef = useRef<HTMLInputElement>(null)
  const labelUploadRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function switchTab(t: Tab) {
    setTab(t)
    setExtractState({ status: 'idle' })
    setCameraUnsupported(false)
  }

  async function runAnalysis(productName: string | undefined, ingredients: string, file?: File | null, offImageUrl?: string | null) {
    if (!ingredients.trim()) {
      setExtractState({ status: 'error', message: 'No ingredients found. Try the other tab or a clearer photo.' })
      return
    }
    setLoading(true)
    setError(null)

    let imageUrl: string | undefined = offImageUrl ?? undefined

    if (file) {
      setExtractState({ status: 'loading', message: 'Uploading photo…', step: 1, totalSteps: 3 })
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scan-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('scan-images').getPublicUrl(uploadData.path)
          imageUrl = publicUrl
        }
      }
    }

    setExtractState({ status: 'loading', message: 'Analyzing ingredients…', step: file ? 2 : 1, totalSteps: file ? 3 : 2 })

    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName || undefined,
        ingredients: ingredients.trim(),
        image_url: imageUrl,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Scan failed. Please try again.')
      setLoading(false)
      return
    }

    setExtractState({ status: 'loading', message: 'Saving to history…', step: file ? 3 : 2, totalSteps: file ? 3 : 2 })

    if (json._save_error) {
      console.error('[scanner] scan save error:', json._save_error)
    }

    if (json.id) {
      window.location.href = `/scan/${json.id}`
    } else {
      setInlineResult({ analysis: json.analysis, productName: productName || 'Product Analysis', saveError: json._save_error })
      setLoading(false)
    }
  }

  async function resizeAndEncode(file: File, maxPx: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('canvas')); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function runVisionExtract(file: File) {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setExtractState({ status: 'loading', message: 'Reading product label…' })
    try {
      const base64 = await resizeAndEncode(file, 2048)

      const res = await fetch('/api/vision-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64 }),
      })
      const json = await res.json()

      // Vision found the product name but not the ingredient list — try a database lookup
      if (!json.ingredients && json.product_name) {
        setExtractState({ status: 'loading', message: `Looking up "${json.product_name}"…` })
        const lookupRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_name: json.product_name }),
        })
        const lookupJson = await lookupRes.json()
        if (lookupRes.ok && lookupJson.ingredients) {
          setExtractState({ status: 'loading', message: 'Analyzing ingredients…' })
          await runAnalysis(lookupJson.product_name ?? json.product_name, lookupJson.ingredients, file, lookupJson.product_image_url)
          return
        }
      }

      if (!res.ok || !json.ingredients) {
        setExtractState({ status: 'error', message: json.error ?? "Couldn't read the ingredient list. Make sure the label is in focus and try again." })
        return
      }

      setExtractState({ status: 'loading', message: 'Analyzing ingredients…' })
      await runAnalysis(json.product_name, json.ingredients, file)
    } catch {
      setExtractState({ status: 'error', message: 'Could not process the photo. Please try again.' })
    }
  }

  async function handleBarcodeDetected(barcode: string) {
    setExtractState({ status: 'loading', message: `Looking up barcode…`, step: 1, totalSteps: 2 })
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      })
      const json = await res.json()
      if (!res.ok || !json.ingredients) {
        setExtractState({ status: 'error', message: json.error ?? 'Product not found. Try the Photo tab.' })
        return
      }
      setExtractState({ status: 'loading', message: 'Analyzing ingredients…', step: 2, totalSteps: 2 })
      await runAnalysis(json.product_name, json.ingredients, null, json.product_image_url)
    } catch {
      setExtractState({ status: 'error', message: 'Network error. Please try again.' })
    }
  }

  const handleUnsupported = useCallback(() => setCameraUnsupported(true), [])

  async function handleCameraCapture(file: File) {
    const mode = captureModeRef.current
    setCaptureMode(null)
    if (mode === 'barcode') {
      if ('BarcodeDetector' in window) {
        try {
          const bitmap = await createImageBitmap(file)
          const detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'itf', 'data_matrix'],
          })
          const codes = await detector.detect(bitmap)
          if (codes.length > 0) { handleBarcodeDetected(codes[0].rawValue); return }
        } catch {}
      }
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        const url = URL.createObjectURL(file)
        try {
          const result = await reader.decodeFromImageUrl(url)
          if (result) { handleBarcodeDetected(result.getText()); return }
        } finally {
          URL.revokeObjectURL(url)
        }
      } catch {}
      setExtractState({
        status: 'error',
        message: 'Barcode not found in that photo. Try better lighting, hold the camera steady, or upload the barcode image.',
      })
    } else if (mode === 'label') {
      runVisionExtract(file)
    }
  }

  async function handleBarcodeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setExtractState({ status: 'loading', message: 'Reading barcode…' })

    if ('BarcodeDetector' in window) {
      try {
        const bitmap = await createImageBitmap(file)
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'itf', 'data_matrix'],
        })
        const codes = await detector.detect(bitmap)
        if (codes.length > 0) { handleBarcodeDetected(codes[0].rawValue); return }
      } catch {}
    }

    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      const url = URL.createObjectURL(file)
      try {
        const result = await reader.decodeFromImageUrl(url)
        if (result) { handleBarcodeDetected(result.getText()); return }
      } finally {
        URL.revokeObjectURL(url)
      }
    } catch {}

    setExtractState({ status: 'error', message: 'Barcode not found in that image. Try a clearer photo.' })
  }

  function handleLabelFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    runVisionExtract(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setExtractState({ status: 'idle' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {lightboxOpen && imagePreview && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
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
            src={imagePreview}
            alt="Product photo"
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

      {captureMode && (
        <CameraCapture
          mode={captureMode}
          onCapture={handleCameraCapture}
          onClose={() => setCaptureMode(null)}
          onBarcodeDetected={captureMode === 'barcode' ? (barcode) => {
            setCaptureMode(null)
            handleBarcodeDetected(barcode)
          } : undefined}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .scanner-wrap {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px 100px;
        }
        @media (min-width: 640px) {
          .scanner-wrap { padding: 40px 28px 60px; }
        }

        .tab-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: #fff;
          border: 1px solid #e9eef4;
          border-radius: 18px;
          padding: 6px;
          margin-bottom: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 6px 12px;
          border-radius: 13px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.16s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .tab-btn:hover { color: #64748b; background: #f8fafc; }
        .tab-btn:active { transform: scale(0.95); background: rgba(0,195,122,0.13); color: #007a4d; }
        .tab-btn.active { background: rgba(0,195,122,0.1); color: #007a4d; }
        .tab-btn.active svg { stroke: #00C37A; }

        .scan-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e9eef4;
          padding: 20px;
          margin-bottom: 14px;
          box-shadow: 0 6px 28px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06);
        }
        @media (min-width: 640px) {
          .scan-card { padding: 24px; }
        }
        .scan-card-title {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 4px;
        }
        .scan-card-desc {
          font-size: 13.5px;
          color: #94a3b8;
          margin: 0 0 16px;
          line-height: 1.55;
        }

        .capture-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .capture-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 18px 12px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          min-height: 88px;
        }
        .capture-btn:hover { border-color: #94a3b8; color: #334155; background: #f8fafc; }
        .capture-btn:active { transform: scale(0.96); opacity: 0.82; }
        .capture-btn.primary {
          border-color: rgba(0,195,122,0.6);
          background: rgba(0,195,122,0.06);
          color: #007a4d;
        }
        .capture-btn.primary:hover { background: rgba(0,195,122,0.12); border-color: #00C37A; color: #007a4d; }
        .capture-btn-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: #f1f5f9;
          display: flex; align-items: center; justify-content: center;
        }
        .capture-btn.primary .capture-btn-icon { background: rgba(0,195,122,0.14); }
      `}</style>

      <div className="scanner-wrap">
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: '28px', fontWeight: 700, color: '#0f172a',
            margin: '0 0 5px', letterSpacing: '-0.3px', lineHeight: 1.2,
          }}>
            New Scan
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
            Scan a barcode or take a photo of the product packaging.
          </p>
        </div>

        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            marginBottom: '16px', padding: '13px 16px', borderRadius: '13px',
            background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c',
            fontSize: '13.5px', lineHeight: 1.5,
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <div style={{
            padding: '28px 24px', borderRadius: '20px', background: '#fff',
            border: '1px solid #e9eef4', textAlign: 'center',
            boxShadow: '0 6px 28px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.9s linear infinite', marginBottom: '14px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {extractState.status === 'loading' && extractState.totalSteps && extractState.step ? (
              <>
                <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>{extractState.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {Array.from({ length: extractState.totalSteps }, (_, i) => (
                    <div key={i} style={{
                      width: i < extractState.step! ? 24 : 8,
                      height: 6, borderRadius: '99px',
                      background: i < extractState.step! ? '#00C37A' : '#e2e8f0',
                      transition: 'all 0.35s ease',
                    }} />
                  ))}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Step {extractState.step} of {extractState.totalSteps}
                </p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: 500 }}>Analyzing ingredients…</p>
            )}
          </div>
        )}

        {!loading && (
          <>
            {tab === 'barcode' && (
              <div className="scan-card">
                <p className="scan-card-title">Scan Barcode</p>
                <p className="scan-card-desc">
                  Point your camera at a product barcode. Works on most packaged foods and other items.
                </p>
                {!cameraUnsupported && extractState.status !== 'success' && (
                  <div style={{ marginBottom: '14px' }}>
                    <BarcodeCamera onDetected={handleBarcodeDetected} onUnsupported={handleUnsupported} />
                  </div>
                )}
                <input ref={barcodeUploadRef} type="file" accept="image/*" onChange={handleBarcodeFile} style={{ display: 'none' }} />
                <div className="capture-grid">
                  <button type="button" className="capture-btn" onClick={() => barcodeUploadRef.current?.click()}>
                    <span className="capture-btn-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </span>
                    Upload Image
                  </button>
                  <button type="button" className="capture-btn primary" onClick={() => setCaptureMode('barcode')}>
                    <span className="capture-btn-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9V6a1 1 0 0 1 1-1h3M15 5h3a1 1 0 0 1 1 1v3M21 15v3a1 1 0 0 1-1 1h-3M9 19H6a1 1 0 0 1-1-1v-3"/>
                        <line x1="7" y1="9" x2="7" y2="15"/>
                        <line x1="10" y1="9" x2="10" y2="15"/>
                        <line x1="14" y1="9" x2="14" y2="15"/>
                        <line x1="17" y1="9" x2="17" y2="15"/>
                      </svg>
                    </span>
                    Take Photo
                  </button>
                </div>
                <ExtractStatus state={extractState} onRetry={extractState.status === 'error' ? () => {
                  setExtractState({ status: 'idle' })
                  setCaptureMode('barcode')
                } : undefined} />
              </div>
            )}

            {tab === 'label' && (
              <div className="scan-card">
                <p className="scan-card-title">Product Photo</p>
                <p className="scan-card-desc">
                  Take a photo of the ingredient label. Works for food, medication, supplements, and more.
                </p>
                <input ref={labelUploadRef} type="file" accept="image/*" onChange={handleLabelFile} style={{ display: 'none' }} />

                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #e2e8f0', marginBottom: extractState.status !== 'idle' ? '14px' : 0 }}>
                    <img
                      src={imagePreview}
                      alt="Label preview"
                      onClick={() => setLightboxOpen(true)}
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                    />
                    <div
                      onClick={() => setLightboxOpen(true)}
                      style={{
                        position: 'absolute', top: 10, left: 10,
                        background: 'rgba(0,0,0,0.52)', borderRadius: '7px',
                        padding: '4px 9px', display: 'flex', alignItems: 'center', gap: '5px',
                        color: '#fff', fontSize: '11px', fontWeight: 600,
                        cursor: 'zoom-in',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                      Tap to enlarge
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', border: 'none',
                        color: '#fff', fontSize: '20px', lineHeight: 1,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="capture-grid">
                    <button type="button" className="capture-btn" onClick={() => labelUploadRef.current?.click()}>
                      <span className="capture-btn-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </span>
                      Upload Photo
                    </button>
                    <button type="button" className="capture-btn primary" onClick={() => setCaptureMode('label')}>
                      <span className="capture-btn-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C37A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </span>
                      Take Photo
                    </button>
                  </div>
                )}

                <ExtractStatus state={extractState} onRetry={extractState.status === 'error' ? () => {
                  setExtractState({ status: 'idle' })
                  setImagePreview(null)
                  setImageFile(null)
                  setCaptureMode('label')
                } : undefined} />
              </div>
            )}
          </>
        )}

        {inlineResult && (
          <InlineResult result={inlineResult} onReset={() => {
            setInlineResult(null)
            setImagePreview(null)
            setImageFile(null)
            setExtractState({ status: 'idle' })
          }} onViewDashboard={() => { window.location.href = '/dashboard' }} />
        )}
      </div>
    </div>
  )
}

function InlineResult({ result, onReset, onViewDashboard }: { result: { analysis: AnalysisResult; productName: string; saveError?: string }; onReset: () => void; onViewDashboard: () => void }) {
  const { analysis, productName, saveError } = result
  const cfg = GRADE_CFG[analysis.overall_grade]
  const concerns = analysis.ingredients.filter(i => !i.safe).length
  const userAlerts = analysis.user_alerts ?? []

  return (
    <div style={{ marginTop: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #e9eef4', overflow: 'hidden', boxShadow: '0 6px 28px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: cfg.color, flexShrink: 0 }}>
          {analysis.overall_grade}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{productName}</p>
          <p style={{ margin: 0, fontSize: '13px', color: cfg.color, fontWeight: 600 }}>{cfg.label}</p>
          {concerns > 0 && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{concerns} ingredient{concerns !== 1 ? 's' : ''} with concerns</p>}
        </div>
      </div>

      {userAlerts.length > 0 && (
        <div style={{ margin: '0 20px 0', padding: '12px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginTop: '14px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.09em', color: '#ef4444', textTransform: 'uppercase' }}>Personal Alerts</p>
          {userAlerts.map((alert, i) => (
            <p key={i} style={{ margin: 0, fontSize: '12.5px', color: '#b91c1c', fontWeight: 600, lineHeight: 1.5 }}>⚠ {alert}</p>
          ))}
        </div>
      )}

      {analysis.summary && (
        <div style={{ padding: '14px 20px', background: '#f8fafc', fontSize: '13.5px', color: '#475569', lineHeight: 1.65, marginTop: userAlerts.length > 0 ? '14px' : 0 }}>
          {analysis.summary}
        </div>
      )}

      <div style={{ padding: '14px 20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>Ingredients</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analysis.ingredients.map((ing, i) => {
            const ic = GRADE_CFG[ing.grade]
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: ing.flagged ? '8px 10px' : '0',
                borderRadius: ing.flagged ? '10px' : '0',
                background: ing.flagged ? 'rgba(239,68,68,0.05)' : 'transparent',
                border: ing.flagged ? '1px solid rgba(239,68,68,0.15)' : 'none',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ing.flagged ? 'rgba(239,68,68,0.12)' : ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: ing.flagged ? '#ef4444' : ic.color, flexShrink: 0 }}>
                  {ing.flagged ? '!' : ing.grade}
                </div>
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: ing.flagged ? '#b91c1c' : '#0f172a' }}>{ing.name}</p>
                    {ing.flagged && <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Alert</span>}
                  </div>
                  {ing.concern && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.45 }}>{ing.concern}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {saveError && (
        <div style={{ margin: '0 20px 14px', padding: '10px 13px', borderRadius: '10px', background: '#fff7ed', border: '1px solid #fed7aa', fontSize: '12.5px', color: '#9a3412', lineHeight: 1.5 }}>
          <strong>Note:</strong> This scan couldn't be saved to your history. ({saveError})
        </div>
      )}

      <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={onViewDashboard}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00C37A 0%, #00a868 100%)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          View Dashboard
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Scan Another Product
        </button>
      </div>
    </div>
  )
}

function ExtractStatus({ state, onRetry }: { state: ExtractState; onRetry?: () => void }) {
  if (state.status === 'idle') return null

  const config = {
    loading: { bg: 'rgba(0,195,122,0.06)', border: 'rgba(0,195,122,0.2)', color: '#007a4d' },
    success: { bg: 'rgba(0,195,122,0.08)', border: 'rgba(0,195,122,0.25)', color: '#007a4d' },
    error: { bg: '#fff1f2', border: '#fecdd3', color: '#be123c' },
  }[state.status]

  return (
    <div style={{
      marginTop: '14px', padding: '11px 14px', borderRadius: '11px',
      fontSize: '13.5px', lineHeight: 1.5,
      display: 'flex', alignItems: 'center', gap: '9px',
      background: config.bg, border: `1px solid ${config.border}`, color: config.color,
    }}>
      {state.status === 'loading' && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, animation: 'spin 0.9s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      {state.status === 'error' && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      <span style={{ flex: 1 }}>{state.message}</span>
      {state.status === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            flexShrink: 0, padding: '5px 13px', borderRadius: '100px',
            border: '1.5px solid #fca5a5', background: 'transparent',
            color: '#be123c', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'background 0.13s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}
