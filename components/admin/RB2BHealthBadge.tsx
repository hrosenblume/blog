import { prisma } from '@/lib/db'

const HOUR = 1000 * 60 * 60
const DAY = 24 * HOUR

function formatAge(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.floor(ms / (60 * 1000)))}m ago`
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`
  if (ms < 30 * DAY) return `${Math.floor(ms / DAY)}d ago`
  if (ms < 365 * DAY) return `${Math.floor(ms / (30 * DAY))}mo ago`
  return `${Math.floor(ms / (365 * DAY))}y ago`
}

type Status = 'live' | 'slow' | 'down' | 'never'

function classify(ageMs: number, hasAny: boolean): Status {
  if (!hasAny) return 'never'
  if (ageMs < DAY) return 'live'
  if (ageMs < 7 * DAY) return 'slow'
  return 'down'
}

const STATUS_STYLES: Record<Status, { dot: string; pill: string; label: string }> = {
  live: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    label: 'Live',
  },
  slow: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    label: 'Slow',
  },
  down: {
    dot: 'bg-red-500',
    pill: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    label: 'Down',
  },
  never: {
    dot: 'bg-muted-foreground',
    pill: 'bg-muted text-muted-foreground border-border',
    label: 'No data',
  },
}

export async function RB2BHealthBadge() {
  const last = await prisma.leadVisit.findFirst({
    orderBy: { visitedAt: 'desc' },
    select: { visitedAt: true },
  })

  const hasAny = !!last
  const ageMs = last ? Date.now() - last.visitedAt.getTime() : Infinity
  const status = classify(ageMs, hasAny)
  const style = STATUS_STYLES[status]

  const detail = hasAny
    ? `last visit ${formatAge(ageMs)}`
    : 'no visits recorded'

  const hint = status === 'down'
    ? ' — check RB2B destination'
    : ''

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${style.pill}`}
      title={`RB2B webhook health: ${style.label} (${detail}${hint})`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
      RB2B {style.label} · {detail}{hint}
    </span>
  )
}
