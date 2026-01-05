import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonPostList } from '@/components/writer/SkeletonPostList'

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Idea input section */}
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
      <SkeletonPostList count={5} />
    </div>
  )
}

