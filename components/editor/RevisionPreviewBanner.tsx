import { formatRelativeTime } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import type { RevisionFull } from '@/lib/editor/types'

interface Props {
  revision: RevisionFull
  onCancel: () => void
  onRestore: () => void
}

export function RevisionPreviewBanner({ revision, onCancel, onRestore }: Props) {
  return (
    <div className="border-b border-border px-4 py-2 flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        Viewing version from {formatRelativeTime(revision.createdAt)}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onRestore}>
          Restore this version
        </Button>
      </div>
    </div>
  )
}

