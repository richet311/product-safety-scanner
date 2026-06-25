'use client'

type ScanItem = { created_at: string }

export function DailyUsage({ scans, dailyLimit }: { scans: ScanItem[]; dailyLimit: number }) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart.getTime() + 86400000)

  const todayCount = scans.filter(s => {
    const t = new Date(s.created_at)
    return t >= todayStart && t < tomorrowStart
  }).length

  const remaining = dailyLimit - todayCount
  const atLimit = todayCount >= dailyLimit
  const usagePct = Math.min((remaining / dailyLimit) * 100, 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '320px' }}>
      <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          width: `${usagePct}%`,
          height: '100%',
          borderRadius: '99px',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          background: atLimit
            ? 'linear-gradient(90deg, #f97316, #ef4444)'
            : 'linear-gradient(90deg, #00C37A, #00e896)',
        }} />
      </div>
      <span style={{
        fontSize: '12px', fontWeight: 600,
        color: atLimit ? '#ef4444' : '#94a3b8',
        whiteSpace: 'nowrap', fontFamily: 'inherit',
      }}>
        {atLimit ? 'Limit reached' : `${remaining} / ${dailyLimit} left today`}
      </span>
    </div>
  )
}
