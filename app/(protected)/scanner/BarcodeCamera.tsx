'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  onDetected: (barcode: string) => void
  onUnsupported: () => void
}

export default function BarcodeCamera({ onDetected, onUnsupported }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const foundRef = useRef(false)
  const [active, setActive] = useState(false)
  const [permissionError, setPermissionError] = useState(false)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    foundRef.current = false
    setActive(false)
  }, [])

  useEffect(() => {
    if (!('BarcodeDetector' in window)) onUnsupported()
    return stop
  }, [stop, onUnsupported])

  function scan() {
    if (!videoRef.current || foundRef.current) return
    detectorRef.current
      ?.detect(videoRef.current)
      .then((codes: any[]) => {
        if (codes.length > 0 && !foundRef.current) {
          foundRef.current = true
          // Manually clean up without calling stop() — stop() resets foundRef which
          // would allow a stale promise to re-fire onDetected a second time.
          cancelAnimationFrame(rafRef.current)
          streamRef.current?.getTracks().forEach(t => t.stop())
          streamRef.current = null
          setActive(false)
          onDetected(codes[0].rawValue)
        } else {
          rafRef.current = requestAnimationFrame(scan)
        }
      })
      .catch(() => { rafRef.current = requestAnimationFrame(scan) })
  }

  async function start() {
    setPermissionError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      detectorRef.current = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_128', 'code_39', 'itf'],
      })
      setActive(true)
      rafRef.current = requestAnimationFrame(scan)
    } catch {
      setPermissionError(true)
    }
  }

  if (permissionError) {
    return (
      <div style={{ padding: '16px', borderRadius: '12px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: '13.5px', lineHeight: 1.5 }}>
        Camera access was denied. Please allow camera permissions in your browser settings and try again.
      </div>
    )
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={start}
        style={{
          width: '100%', padding: '22px 18px',
          borderRadius: '16px', border: '2px dashed #cbd5e1',
          background: '#f8fafc', color: '#475569',
          fontSize: '15px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '10px', transition: 'all 0.15s ease',
          minHeight: '140px',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = '#00C37A'
          el.style.background = 'rgba(0,195,122,0.04)'
          el.style.color = '#007a4d'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = '#cbd5e1'
          el.style.background = '#f8fafc'
          el.style.color = '#475569'
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '14px',
          background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V6a1 1 0 0 1 1-1h3M15 5h3a1 1 0 0 1 1 1v3M21 15v3a1 1 0 0 1-1 1h-3M9 19H6a1 1 0 0 1-1-1v-3"/>
            <line x1="7" y1="9" x2="7" y2="15"/>
            <line x1="10" y1="9" x2="10" y2="15"/>
            <line x1="14" y1="9" x2="14" y2="15"/>
            <line x1="17" y1="9" x2="17" y2="15"/>
          </svg>
        </div>
        <span>Tap to open barcode scanner</span>
        <span style={{ fontSize: '12.5px', fontWeight: 400, color: '#94a3b8' }}>Point camera at any product barcode</span>
      </button>
    )
  }

  const bracketSize = 22
  const bracketThickness = 3

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
      <style>{`
        @keyframes bc-scan {
          0%   { top: 8%; opacity: 0; }
          5%   { opacity: 1; }
          48%  { top: 86%; opacity: 1; }
          52%  { top: 86%; opacity: 0; }
          53%  { top: 8%; opacity: 0; }
          100% { top: 8%; opacity: 0; }
        }
        .bc-scan-line {
          position: absolute;
          left: 2px; right: 2px;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #00C37A 30%, #00e896 50%, #00C37A 70%, transparent 100%);
          box-shadow: 0 0 10px 2px rgba(0,195,122,0.6);
          animation: bc-scan 2.4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {/* Scan zone — shadow on outside creates the dark vignette */}
        <div style={{
          position: 'relative',
          width: '78%',
          height: '44%',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
          borderRadius: '4px',
        }}>
          {/* Corner brackets */}
          {/* Top-left */}
          <span style={{ position: 'absolute', top: 0, left: 0, width: bracketSize, height: bracketSize, borderTop: `${bracketThickness}px solid #00C37A`, borderLeft: `${bracketThickness}px solid #00C37A`, borderRadius: '3px 0 0 0' }} />
          {/* Top-right */}
          <span style={{ position: 'absolute', top: 0, right: 0, width: bracketSize, height: bracketSize, borderTop: `${bracketThickness}px solid #00C37A`, borderRight: `${bracketThickness}px solid #00C37A`, borderRadius: '0 3px 0 0' }} />
          {/* Bottom-left */}
          <span style={{ position: 'absolute', bottom: 0, left: 0, width: bracketSize, height: bracketSize, borderBottom: `${bracketThickness}px solid #00C37A`, borderLeft: `${bracketThickness}px solid #00C37A`, borderRadius: '0 0 0 3px' }} />
          {/* Bottom-right */}
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: bracketSize, height: bracketSize, borderBottom: `${bracketThickness}px solid #00C37A`, borderRight: `${bracketThickness}px solid #00C37A`, borderRadius: '0 0 3px 0' }} />

          {/* Scanning line */}
          <div className="bc-scan-line" />
        </div>
      </div>

      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 16px 14px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,195,122,0.2)', border: '1px solid rgba(0,195,122,0.5)',
          color: '#00e896', fontSize: '12.5px', fontWeight: 600,
          padding: '5px 12px', borderRadius: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C37A', display: 'inline-block', animation: 'bc-pulse 1.4s ease-in-out infinite' }} />
          Align barcode within the frame
        </span>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={stop}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)', border: 'none',
          color: '#fff', fontSize: '22px', lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto',
        }}
        aria-label="Stop camera"
      >
        ×
      </button>
    </div>
  )
}
