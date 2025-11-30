import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

const statusStyles: Record<string, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  writer: 'bg-secondary text-secondary-foreground',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn(statusStyles[status] || statusStyles.writer)}
    >
      {status}
    </Badge>
  )
}
