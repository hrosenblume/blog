import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton placeholder shown while AI is generating essay content.
 * Displays animated placeholder lines that mimic paragraph structure.
 * As real content streams in, this is replaced by the actual text.
 */
export function GeneratingSkeleton() {
  return (
    <div className="space-y-6 py-2">
      {/* First paragraph - 4 lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Second paragraph - 3 lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Third paragraph - 4 lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}




