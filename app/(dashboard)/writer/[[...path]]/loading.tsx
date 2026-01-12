import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mt-4 mb-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <Skeleton className="h-10 w-16 mr-4" />
        <Skeleton className="h-10 w-20 mr-4" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Post list */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
