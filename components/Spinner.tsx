import { cn } from '@/lib/utils/cn'

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn('animate-spin w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full', className)} />
)

