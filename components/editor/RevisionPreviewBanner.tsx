import { formatRelativeTime } from '@/lib/utils/format'
import type { RevisionFull } from '@/lib/editor/types'

interface Props {
  revision: RevisionFull
}

export function RevisionPreviewBanner({ revision }: Props) {
  return (
    <div className="border-b border-border px-4 py-2 text-center">
      <span className="text-sm text-muted-foreground">
        Viewing version from {formatRelativeTime(revision.createdAt)}
      </span>
    </div>
  )
}





