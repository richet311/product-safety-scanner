'use client'

import { useRef, useState, useEffect } from 'react'

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
  mode?: 'barcode' | 'label'
  onBarcodeDetected?: (barcode: string) => void
}

// Maps display-space frame percentages → source rectangle in actual video pixels,
// accounting for objectFit: cover scaling/clipping.
function getFrameCrop(video: HTMLVideoElement, frameWPct: number, frameHPct: number) {
  const dW = video.clientWidth || video.videoWidth
  const dH = video.clientHeight || video.videoHeight
  const vW = video.videoWidth
  const vH = video.videoHeight
  const scale = Math.max(dW / vW, dH / vH)
  const clipX = (vW * scale - dW) / 2
  const clipY = (vH * scale - dH) / 2
  const sx = Math.max(0, (dW * (1 - frameWPct) / 2 + clipX) / scale)
  const sy = Math.max(0, (dH * (1 - frameHPct) / 2 + clipY) / scale)
  const sw = Math.min(vW - sx, (dW * frameWPct) / scale)
  const sh = Math.min(vH - sy, (dH * frameHPct) / scale)
  return { sx, sy, sw: Math.round(sw), sh: Math.round(sh) }
}

export default function CameraCapture({ onCapture, onClose, mode = 'label', onBarcodeDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [barcodeDetected, setBarcodeDetected] = useState(false)
  const capturedRef = useRef(false)

  // Keep a stable ref so the scan loop always sees the latest callback
  // without restarting the effect on every render.
  const onBarcodeDetectedRef = useRef(onBarcodeDetected)
  useEffect(() => { onBarcodeDetectedRef.current = onBarcodeDetected })

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch {
        setError('Camera access was denied. Please allow camera permissions in your browser settings.')
      }
    }
    start()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  useEffect(() => {
    if (mode !== 'barcode' || !ready) return

    const video = videoRef.current
    if (!video) return

    let cancelled = false

    function onFound(rawValue: string) {
      if (capturedRef.current) return
      capturedRef.current = true
      setBarcodeDetected(true)
      setTimeout(() => {
        if (cancelled) return
        streamRef.current?.getTracks().forEach(t => t.stop())
        onBarcodeDetectedRef.current?.(rawValue)
      }, 300)
    }

    if ('BarcodeDetector' in window) {
      // Native — fastest, Chrome + iOS 17+
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'data_matrix'],
      })
      let rafId: number
      async function scan() {
        if (cancelled || capturedRef.current) return
        const v = videoRef.current
        if (v && v.readyState >= 2) {
          try {
            const barcodes = await detector.detect(v)
            if (barcodes.length > 0) { onFound(barcodes[0].rawValue); return }
          } catch {}
        }
        rafId = requestAnimationFrame(scan)
      }
      rafId = requestAnimationFrame(scan)
      return () => { cancelled = true; cancelAnimationFrame(rafId) }
    } else {
      // ZXing fallback — works on iOS Safari and all other browsers
      let zxingControls: { stop: () => void } | null = null
      import('@zxing/browser').then(({ BrowserMultiFormatReader }) => {
        if (cancelled) return
        const reader = new BrowserMultiFormatReader()
        reader.decodeFromVideoElement(video, (result) => {
          if (result && !capturedRef.current) onFound(result.getText())
        }).then(controls => {
          if (cancelled) { try { controls.stop() } catch {} }
          else zxingControls = controls
        }).catch(() => {})
      })
      return () => {
        cancelled = true
        try { zxingControls?.stop() } catch {}
      }
    }
  }, [mode, ready])

  function capture() {
    const video = videoRef.current
    if (!video) return

    const frameWPct = mode === 'barcode' ? 0.80 : 0.82
    const frameHPct = mode === 'barcode' ? 0.38 : 0.72
    const { sx, sy, sw, sh } = getFrameCrop(video, frameWPct, frameHPct)

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    canvas.getContext('2d')?.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh)
    canvas.toBlob(blob => {
      if (!blob) return
      streamRef.current?.getTracks().forEach(t => t.stop())
      onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  function close() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    onClose()
  }

  const B = 22
  const T = 3

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) close() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes cc-scan {
          0%   { top: 6%;  opacity: 0; }
          5%   { opacity: 1; }
          47%  { top: 88%; opacity: 1; }
          52%  { top: 88%; opacity: 0; }
          53%  { top: 6%;  opacity: 0; }
          100% { top: 6%;  opacity: 0; }
        }
        .cc-scan-line {
          position: absolute;
          left: 2px; right: 2px;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #00C37A 30%, #00e896 50%, #00C37A 70%, transparent 100%);
          box-shadow: 0 0 10px 2px rgba(0,195,122,0.6);
          animation: cc-scan 2.4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes cc-pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .cc-dot { animation: cc-pulse 1.4s ease-in-out infinite; }
      `}</style>

      <div style={{
        background: '#000', borderRadius: '22px', overflow: 'hidden',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        <button
          type="button"
          onClick={close}
          onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; e.currentTarget.style.opacity = '0.7' }}
          onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
          onPointerLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)', border: 'none',
            color: '#fff', fontSize: '22px', lineHeight: 1,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.1s, opacity 0.1s',
          }}
          aria-label="Close camera"
        >
          ×
        </button>

        {error ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#fca5a5', fontSize: '14px', lineHeight: 1.7 }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>📷</div>
            {error}
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
              />

              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                {mode === 'barcode' ? (
                  <div style={{
                    position: 'relative',
                    width: '80%',
                    height: '38%',
                    boxShadow: `0 0 0 9999px ${barcodeDetected ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)'}`,
                    borderRadius: '4px',
                    transition: 'box-shadow 0.15s ease',
                    background: barcodeDetected ? 'rgba(0,195,122,0.08)' : 'transparent',
                  }}>
                    {(['tl','tr','bl','br'] as const).map(corner => (
                      <span key={corner} style={{
                        position: 'absolute',
                        width: B, height: B,
                        top: corner.startsWith('t') ? 0 : undefined,
                        bottom: corner.startsWith('b') ? 0 : undefined,
                        left: corner.endsWith('l') ? 0 : undefined,
                        right: corner.endsWith('r') ? 0 : undefined,
                        borderTop: corner.startsWith('t') ? `${T}px solid ${barcodeDetected ? '#fff' : '#00C37A'}` : undefined,
                        borderBottom: corner.startsWith('b') ? `${T}px solid ${barcodeDetected ? '#fff' : '#00C37A'}` : undefined,
                        borderLeft: corner.endsWith('l') ? `${T}px solid ${barcodeDetected ? '#fff' : '#00C37A'}` : undefined,
                        borderRight: corner.endsWith('r') ? `${T}px solid ${barcodeDetected ? '#fff' : '#00C37A'}` : undefined,
                        borderRadius: corner === 'tl' ? '3px 0 0 0' : corner === 'tr' ? '0 3px 0 0' : corner === 'bl' ? '0 0 0 3px' : '0 0 3px 0',
                        transition: 'border-color 0.15s ease',
                      }} />
                    ))}
                    {!barcodeDetected && <div className="cc-scan-line" />}
                  </div>
                ) : (
                  <div style={{
                    position: 'relative',
                    width: '82%',
                    height: '72%',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.48)',
                    borderRadius: '8px',
                    border: '1.5px dashed rgba(0,195,122,0.55)',
                  }}>
                    <span style={{ position: 'absolute', top: -2, left: -2, width: B, height: B, borderTop: `${T}px solid #00C37A`, borderLeft: `${T}px solid #00C37A`, borderRadius: '6px 0 0 0' }} />
                    <span style={{ position: 'absolute', top: -2, right: -2, width: B, height: B, borderTop: `${T}px solid #00C37A`, borderRight: `${T}px solid #00C37A`, borderRadius: '0 6px 0 0' }} />
                    <span style={{ position: 'absolute', bottom: -2, left: -2, width: B, height: B, borderBottom: `${T}px solid #00C37A`, borderLeft: `${T}px solid #00C37A`, borderRadius: '0 0 0 6px' }} />
                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: B, height: B, borderBottom: `${T}px solid #00C37A`, borderRight: `${T}px solid #00C37A`, borderRadius: '0 0 6px 0' }} />
                  </div>
                )}
              </div>

              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '24px 16px 14px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                display: 'flex', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: 'rgba(0,195,122,0.18)', border: '1px solid rgba(0,195,122,0.45)',
                  color: '#00e896', fontSize: '12.5px', fontWeight: 600,
                  padding: '5px 14px', borderRadius: '20px',
                  backdropFilter: 'blur(4px)',
                }}>
                  <span className="cc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C37A', display: 'inline-block' }} />
                  {mode === 'barcode'
                    ? (barcodeDetected ? '✓ Barcode detected!' : 'Align barcode within the frame')
                    : 'Center the label within the frame'}
                </span>
              </div>
            </div>

            <div style={{
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0a0a0a',
              gap: '32px',
            }}>
              <button
                type="button"
                onClick={close}
                onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; e.currentTarget.style.opacity = '0.65' }}
                onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
                onPointerLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#94a3b8', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit', transition: 'transform 0.1s, opacity 0.1s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={capture}
                disabled={!ready}
                style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: ready ? '#fff' : '#444',
                  border: `4px solid ${ready ? 'rgba(255,255,255,0.35)' : '#333'}`,
                  outline: ready ? '2px solid #fff' : 'none',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.1s, background 0.2s, outline 0.2s, opacity 0.1s',
                  boxShadow: ready ? '0 0 0 6px rgba(255,255,255,0.1)' : 'none',
                  flexShrink: 0,
                }}
                onPointerDown={e => { if (ready) { e.currentTarget.style.transform = 'scale(0.88)'; e.currentTarget.style.opacity = '0.75' } }}
                onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
                onPointerLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
                aria-label="Take photo"
              />

              <div style={{ width: 44 }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
