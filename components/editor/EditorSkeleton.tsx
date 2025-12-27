import { Skeleton } from '@/components/ui/skeleton'
import { CONTENT_WIDTH, CONTENT_PADDING } from '@/lib/article-layout'

/**
 * Skeleton placeholder for the editor page.
 * Used by loading.tsx and the page's inline loading state.
 */
export function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border flex items-center justify-start md:justify-center gap-0.5 px-4 py-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded" />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
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
      </main>
    </div>
  )
}



