import { Button } from '@/components/ui/button'
import type { AIPreview } from '@/lib/editor/types'

interface AIPreviewBannerProps {
  preview: AIPreview
  onAccept: () => void
  onDiscard: () => void
}

export function AIPreviewBanner({ preview, onAccept, onDiscard }: AIPreviewBannerProps) {
  return (
    <div className="border-b border-indigo-500/30 bg-indigo-950/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">✨</span>
          <div className="text-sm">
            <span className="font-medium text-indigo-300">AI Draft</span>
            <span className="text-muted-foreground"> · {preview.model} · {preview.wordCount} words</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" onClick={onAccept}>
            Accept & Edit
          </Button>
        </div>
      </div>
    </div>
  )
}


