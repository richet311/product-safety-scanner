'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ScanCard } from './ScanCard'
import type { Scan } from './ScanCard'

const PAGE_SIZE = 10

type DayGroup = {
  key: string
  label: string
  count: number
  scans: Scan[]
}

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDayLabel(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const scanDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today.getTime() - scanDay.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function groupScansByDay(scans: Scan[]): DayGroup[] {
  const grouped = new Map<string, { date: Date; scans: Scan[] }>()

  for (const scan of scans) {
    const date = new Date(scan.created_at)
    const key = localDateKey(date)
    const existing = grouped.get(key)
    if (existing) {
      existing.scans.push(scan)
    } else {
      grouped.set(key, { date, scans: [scan] })
    }
  }

  return Array.from(grouped.entries()).map(([key, value]) => ({
    key,
    label: getDayLabel(value.date),
    count: value.scans.length,
    scans: value.scans,
  }))
}

export function ScanHistory({ scans }: { scans: Scan[] }) {
  const dayGroups = useMemo(() => groupScansByDay(scans), [scans])
  const [openDay, setOpenDay] = useState(() => dayGroups[0]?.key ?? null)
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})

  if (dayGroups.length === 0) return null

  function visibleCountFor(dayKey: string) {
    return visibleCounts[dayKey] ?? PAGE_SIZE
  }

  function openGroup(dayKey: string) {
    setOpenDay(dayKey)
    setVisibleCounts(prev => ({ ...prev, [dayKey]: prev[dayKey] ?? PAGE_SIZE }))
  }

  function loadMore(dayKey: string, total: number) {
    setVisibleCounts(prev => ({
      ...prev,
      [dayKey]: Math.min((prev[dayKey] ?? PAGE_SIZE) + PAGE_SIZE, total),
    }))
  }

  return (
    <div className="scan-history">
      <style>{`
        .scan-history {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .day-toggle {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .day-title {
          margin: 0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .day-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .day-count {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          white-space: nowrap;
        }
        .day-chevron {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
          transition: transform 0.16s ease, border-color 0.16s ease, color 0.16s ease;
        }
        .day-toggle[aria-expanded="true"] .day-chevron {
          transform: rotate(180deg);
          border-color: rgba(0,195,122,0.35);
          color: #00a868;
        }
        .day-panel {
          padding-bottom: 18px;
        }
        .load-more-row {
          display: flex;
          justify-content: center;
          padding: 16px 0 2px;
        }
        .load-more-btn {
          border: none;
          background: transparent;
          color: #00a868;
          font-size: 13px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          padding: 8px 10px;
        }
        .load-more-btn:hover {
          color: #007a4d;
          text-decoration: underline;
        }
      `}</style>

      {dayGroups.map(group => {
        const isOpen = openDay === group.key
        const visibleCount = visibleCountFor(group.key)
        const visibleScans = group.scans.slice(0, visibleCount)
        const remaining = Math.max(group.count - visibleScans.length, 0)
        const scanWord = group.count === 1 ? 'scan' : 'scans'

        return (
          <section key={group.key}>
            <button
              type="button"
              className="day-toggle"
              aria-expanded={isOpen}
              onClick={() => openGroup(group.key)}
            >
              <span className="day-title">
                {group.label} - {group.count} {scanWord}
              </span>
              <span className="day-count">
                {isOpen ? `${visibleScans.length} shown` : 'View'}
              </span>
              <span className="day-chevron" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className="day-panel">
                <div className="scan-grid">
                  {visibleScans.map(scan => (
                    <ScanCard key={scan.id} scan={scan} />
                  ))}
                </div>

                {remaining > 0 && (
                  <div className="load-more-row">
                    <button
                      type="button"
                      className="load-more-btn"
                      onClick={() => loadMore(group.key, group.count)}
                    >
                      Load 10 more ({remaining} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}

      {!dayGroups.some(group => group.label === 'Today') && (
        <div style={{
          padding: '24px', borderRadius: '16px',
          background: '#fff', border: '1.5px dashed #e2e8f0',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#94a3b8' }}>
            You haven&apos;t scanned anything today.
          </p>
          <Link href="/scanner" className="new-scan-btn" style={{ padding: '8px 18px', fontSize: '13px' }}>
            Scan Now
          </Link>
        </div>
      )}
    </div>
  )
}
