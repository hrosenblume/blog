import { cn } from '@/lib/utils/cn'

interface PageContainerProps {
  children: React.ReactNode
  /** Container max-width: '2xl' (672px) or '5xl' (1024px) */
  width?: '2xl' | '5xl'
  className?: string
}

const widthClasses = {
  '2xl': 'max-w-2xl',
  '5xl': 'max-w-5xl',
}

/**
 * Consistent page container with centered content and standard padding.
 * Use width="2xl" for content pages (essays, homepage).
 * Use width="5xl" for dashboard pages (writer, admin).
 */
export function PageContainer({ children, width = '2xl', className }: PageContainerProps) {
  return (
    <div className={cn(`${widthClasses[width]} mx-auto px-6 py-16`, className)}>
      {children}
    </div>
  )
}

