import { cn } from '@/lib/utils/cn'

interface CenteredPageProps {
  children: React.ReactNode
  className?: string
}

export function CenteredPage({ children, className }: CenteredPageProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      {children}
    </div>
  )
}

