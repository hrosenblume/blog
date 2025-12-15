'use client'

import { Check, X, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { markdownToHtml } from '@/lib/markdown'

interface PreviewModalProps {
  post: {
    id: string
    title: string
    subtitle: string | null
    markdown: string
    sourceUrl: string | null
    topic: {
      name: string
    } | null
  }
  onClose: () => void
  onAccept: () => void
  onReject: () => void
}

export function PreviewModal({ post, onClose, onAccept, onReject }: PreviewModalProps) {
  const html = markdownToHtml(post.markdown)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {post.topic && (
              <span className="bg-muted px-2 py-0.5 rounded">{post.topic.name}</span>
            )}
            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                View Source
              </a>
            )}
          </div>
          <DialogTitle className="text-xl">{post.title}</DialogTitle>
          {post.subtitle && (
            <p className="text-muted-foreground italic">{post.subtitle}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 border-t border-b">
          <article
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
          <Button variant="outline" onClick={onReject}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button onClick={onAccept}>
            <Check className="h-4 w-4 mr-1" />
            Accept & Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

