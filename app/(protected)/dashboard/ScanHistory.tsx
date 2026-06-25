'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteScans } from './actions'
import { ScanCard } from './ScanCard'
import type { Scan } from './ScanCard'

const PAGE_SIZE = 10

type GradeFilter = 'all' | Scan['overall_grade']
type ConcernFilter = 'all' | 'with_concerns' | 'no_concerns'

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

function concernCount(scan: Scan): number {
  return (
    scan.analysis?.concern_ingredients?.length ??
    scan.analysis?.ingredients?.filter(ingredient => !ingredient.safe).length ??
    0
  )
}

function matchesSearch(scan: Scan, query: string): boolean {
  if (!query) return true
  const ingredientNames = [
    ...(scan.analysis?.concern_ingredients ?? []),
    ...(scan.analysis?.ingredients ?? []),
  ].map(ingredient => ingredient.name)
  const haystack = [
    scan.product_name ?? 'Unknown Product',
    scan.overall_grade,
    scan.analysis?.summary ?? '',
    ...ingredientNames,
  ].join(' ').toLowerCase()
  return haystack.includes(query)
}

export function ScanHistory({ scans }: { scans: Scan[] }) {
  const router = useRouter()
  const [openDay, setOpenDay] = useState<string | null>(() => groupScansByDay(scans)[0]?.key ?? null)
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const [concernFilter, setConcernFilter] = useState<ConcernFilter>('all')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [isPending, startTransition] = useTransition()

  const normalizedSearch = search.trim().toLowerCase()

  const allDayGroups = useMemo(() => groupScansByDay(scans), [scans])
  const filteredScans = useMemo(
    () =>
      scans.filter(scan => {
        const concerns = concernCount(scan)
        return (
          matchesSearch(scan, normalizedSearch) &&
          (gradeFilter === 'all' || scan.overall_grade === gradeFilter) &&
          (concernFilter === 'all' ||
            (concernFilter === 'with_concerns' && concerns > 0) ||
            (concernFilter === 'no_concerns' && concerns === 0))
        )
      }),
    [scans, normalizedSearch, gradeFilter, concernFilter]
  )
  const dayGroups = useMemo(() => groupScansByDay(filteredScans), [filteredScans])
  const allDayGroupByKey = useMemo(
    () => new Map(allDayGroups.map(group => [group.key, group])),
    [allDayGroups]
  )

  const hasFilters = normalizedSearch.length > 0 || gradeFilter !== 'all' || concernFilter !== 'all'

  if (allDayGroups.length === 0) return null

  function visibleCountFor(dayKey: string) {
    return visibleCounts[dayKey] ?? PAGE_SIZE
  }

  function resetSelection() {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  function toggleGroup(dayKey: string) {
    setOpenDay(prev => (prev === dayKey ? null : dayKey))
    resetSelection()
    setVisibleCounts(prev => ({ ...prev, [dayKey]: prev[dayKey] ?? PAGE_SIZE }))
  }

  function loadMore(dayKey: string, total: number) {
    setVisibleCounts(prev => ({
      ...prev,
      [dayKey]: Math.min((prev[dayKey] ?? PAGE_SIZE) + PAGE_SIZE, total),
    }))
  }

  function toggleScan(scanId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(scanId)) {
        next.delete(scanId)
      } else {
        next.add(scanId)
      }
      return next
    })
  }

  function selectVisible(scansToSelect: Scan[]) {
    setSelectionMode(true)
    setSelectedIds(prev => {
      const next = new Set(prev)
      for (const scan of scansToSelect) next.add(scan.id)
      return next
    })
  }

  function deleteIds(ids: string[], message: string) {
    if (ids.length === 0 || !window.confirm(message)) return

    startTransition(() => {
      void deleteScans(ids).then(() => {
        resetSelection()
        router.refresh()
      })
    })
  }

  return (
    <div className="scan-history">
      <style>{`
        .scan-history {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .history-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 150px 170px;
          gap: 10px;
          margin-bottom: 12px;
        }
        .history-input,
        .history-select {
          height: 42px;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 12px;
          padding: 0 13px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          outline: none;
        }
        .history-input:focus,
        .history-select:focus {
          border-color: rgba(0,195,122,0.55);
          box-shadow: 0 0 0 3px rgba(0,195,122,0.12);
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
          transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .day-toggle[aria-expanded="true"] .day-chevron {
          transform: rotate(180deg);
          border-color: rgba(0,195,122,0.35);
          color: #00a868;
        }
        .day-drawer {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(-4px);
          transition: grid-template-rows 0.28s ease, opacity 0.2s ease, transform 0.28s ease;
          pointer-events: none;
        }
        .day-drawer.open {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .day-drawer-inner {
          min-height: 0;
          overflow: hidden;
        }
        .day-panel {
          padding: 0 0 18px;
        }
        .day-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin: 2px 0 14px;
        }
        .history-action {
          min-height: 34px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          border-radius: 10px;
          padding: 0 11px;
          font-size: 12px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
        }
        .history-action:hover {
          border-color: rgba(0,195,122,0.45);
          color: #007a4d;
        }
        .history-action.danger {
          color: #dc2626;
          border-color: rgba(239,68,68,0.25);
        }
        .history-action.danger:hover {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.45);
        }
        .history-action:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .selected-pill {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 10px;
          background: rgba(0,195,122,0.1);
          color: #007a4d;
          font-size: 12px;
          font-weight: 800;
        }
        .select-card-shell {
          position: relative;
        }
        .scan-select {
          position: absolute;
          z-index: 5;
          top: 9px;
          left: 9px;
          width: 28px;
          height: 28px;
          border-radius: 9px;
          border: 1px solid rgba(15,23,42,0.14);
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: transparent;
        }
        .scan-select.selected {
          background: #00C37A;
          color: #fff;
          border-color: #00C37A;
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
        .history-empty {
          padding: 24px;
          border-radius: 16px;
          background: #fff;
          border: 1.5px dashed #e2e8f0;
          text-align: center;
        }
        @media (max-width: 560px) {
          .history-filters {
            grid-template-columns: 1fr;
          }
          .day-toggle {
            gap: 8px;
          }
          .day-count {
            display: none;
          }
        }
      `}</style>

      <div className="history-filters">
        <input
          className="history-input"
          type="search"
          value={search}
          onChange={event => {
            setSearch(event.target.value)
            resetSelection()
          }}
          placeholder="Search scanned products"
          aria-label="Search scanned products"
        />
        <select
          className="history-select"
          value={gradeFilter}
          onChange={event => {
            setGradeFilter(event.target.value as GradeFilter)
            resetSelection()
          }}
          aria-label="Filter by grade"
        >
          <option value="all">All grades</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="D">Grade D</option>
        </select>
        <select
          className="history-select"
          value={concernFilter}
          onChange={event => {
            setConcernFilter(event.target.value as ConcernFilter)
            resetSelection()
          }}
          aria-label="Filter by concern status"
        >
          <option value="all">All concerns</option>
          <option value="with_concerns">With concerns</option>
          <option value="no_concerns">No concerns</option>
        </select>
      </div>

      {dayGroups.length === 0 ? (
        <div className="history-empty">
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            {hasFilters ? 'No scans match your filters.' : 'No scans to show.'}
          </p>
        </div>
      ) : (
        dayGroups.map(group => {
          const isOpen = openDay === group.key
          const visibleCount = visibleCountFor(group.key)
          const visibleScans = group.scans.slice(0, visibleCount)
          const remaining = Math.max(group.count - visibleScans.length, 0)
          const scanWord = group.count === 1 ? 'scan' : 'scans'
          const allDayScans = allDayGroupByKey.get(group.key)?.scans ?? group.scans
          const selectedInDay = group.scans.filter(scan => selectedIds.has(scan.id))
          const selectedCount = selectedInDay.length

          return (
            <section key={group.key}>
              <button
                type="button"
                className="day-toggle"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.key)}
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

              <div className={`day-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
                <div className="day-drawer-inner">
                  <div className="day-panel">
                    <div className="day-actions">
                      {!selectionMode ? (
                        <button
                          type="button"
                          className="history-action"
                          onClick={() => {
                            setSelectionMode(true)
                            setSelectedIds(new Set())
                          }}
                        >
                          Select
                        </button>
                      ) : (
                        <>
                          <span className="selected-pill">{selectedCount} selected</span>
                          <button
                            type="button"
                            className="history-action"
                            onClick={() => selectVisible(visibleScans)}
                          >
                            Select visible
                          </button>
                          <button
                            type="button"
                            className="history-action"
                            onClick={resetSelection}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="history-action danger"
                            disabled={selectedCount === 0 || isPending}
                            onClick={() =>
                              deleteIds(
                                selectedInDay.map(scan => scan.id),
                                `Delete ${selectedCount} selected scan${selectedCount === 1 ? '' : 's'} from ${group.label}?`
                              )
                            }
                          >
                            Delete selected
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="history-action danger"
                        disabled={allDayScans.length === 0 || isPending}
                        onClick={() =>
                          deleteIds(
                            allDayScans.map(scan => scan.id),
                            `Delete all ${allDayScans.length} scan${allDayScans.length === 1 ? '' : 's'} from ${group.label}? This will not affect other days.`
                          )
                        }
                      >
                        Delete day
                      </button>
                    </div>

                    <div className="scan-grid">
                      {visibleScans.map(scan => {
                        const isSelected = selectedIds.has(scan.id)
                        return (
                          <div key={scan.id} className="select-card-shell">
                            {selectionMode && (
                              <button
                                type="button"
                                className={`scan-select ${isSelected ? 'selected' : ''}`}
                                aria-label={isSelected ? 'Deselect scan' : 'Select scan'}
                                onClick={() => toggleScan(scan.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                            )}
                            <ScanCard scan={scan} />
                          </div>
                        )
                      })}
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
                </div>
              </div>
            </section>
          )
        })
      )}

      {!hasFilters && !allDayGroups.some(group => group.label === 'Today') && (
        <div className="history-empty">
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
