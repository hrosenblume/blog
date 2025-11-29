const MINUTE = 60_000, HOUR = 3_600_000, DAY = 86_400_000

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / MINUTE)
  const hours = Math.floor(diffMs / HOUR)
  const days = Math.floor(diffMs / DAY)
  
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export const formatDate = (date: Date, short = false) =>
  date.toLocaleDateString('en-US', { month: short ? 'short' : 'long', year: 'numeric' })

export const formatNumber = (num: number) =>
  num >= 1000 ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : num.toString()
