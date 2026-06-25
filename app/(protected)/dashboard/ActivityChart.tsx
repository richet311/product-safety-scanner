'use client'

type ScanSummary = { created_at: string; overall_grade: 'A' | 'B' | 'C' | 'D' }

export function ActivityChart({ scans }: { scans: ScanSummary[] }) {
  const now = new Date()

  const dailyActivity = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 0, 0, 0, 0)
    const dayEnd = new Date(dayStart.getTime() + 86400000)

    const dayScans = scans.filter(s => {
      const t = new Date(s.created_at)
      return t >= dayStart && t < dayEnd
    })

    const dayScore = dayScans.length > 0
      ? Math.round(dayScans.reduce((sum, s) => sum + (s.overall_grade === 'A' ? 100 : s.overall_grade === 'B' ? 75 : s.overall_grade === 'C' ? 40 : 10), 0) / dayScans.length)
      : null

    return {
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayStart.getDay()],
      count: dayScans.length,
      score: dayScore,
      isToday: i === 6,
    }
  })

  const maxDaily = Math.max(...dailyActivity.map(d => d.count), 1)

  return (
    <div className="insight-card">
      <p className="insight-title">Last 7 Days</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '56px' }}>
        {dailyActivity.map((day, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: day.count === 0 ? '3px' : `${Math.round((day.count / maxDaily) * 52) + 4}px`,
              background: day.count === 0 ? '#f1f5f9'
                : day.score! >= 80 ? '#00C37A'
                : day.score! >= 60 ? '#EAB308'
                : day.score! >= 35 ? '#F97316'
                : '#EF4444',
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.4s',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
        {dailyActivity.map((day, i) => (
          <div key={i} style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '9px',
            fontWeight: day.isToday ? 700 : 500,
            color: day.isToday ? '#00C37A' : '#94a3b8',
          }}>
            {day.label}
          </div>
        ))}
      </div>
    </div>
  )
}
