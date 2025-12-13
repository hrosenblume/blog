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

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export function formatSavedTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / MINUTE)
  
  // Show relative time for recent saves
  if (diffSecs < 10) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  
  // Show clock time for today
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
