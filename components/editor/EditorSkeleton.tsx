import { Skeleton } from '@/components/ui/skeleton'
import { CONTENT_WIDTH, CONTENT_PADDING } from '@/lib/article-layout'
import { EditorToolbar } from '@/components/editor/EditorToolbar'

/**
 * Skeleton placeholder for just the content area (title, subtitle, body).
 * Used inside the editor page while post data is loading.
 */
export function ContentSkeleton() {
  return (
    <div className={`${CONTENT_WIDTH} mx-auto ${CONTENT_PADDING} pt-12`}>
      {/* Title */}
      <Skeleton className="h-8 w-full mb-3" />
      {/* Subtitle */}
      <Skeleton className="h-5 w-2/3 mb-2" />
      {/* Byline */}
      <Skeleton className="h-3 w-24 mb-8" />

      {/* Body paragraphs */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full page skeleton for route-level loading (loading.tsx).
 * Shows navbar skeleton + toolbar skeleton + content skeleton.
 */
export function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar skeleton */}
      <header className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      <EditorToolbar loading={true} />

      <main className="flex-1 overflow-auto pb-20 overscroll-contain">
        <ContentSkeleton />
      </main>
    </div>
  )
}


