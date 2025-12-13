import { cn } from '@/lib/utils/cn'
import { PROSE_CLASSES } from '@/lib/article-layout'

// Re-export for components that need direct access (e.g., TiptapEditor)
export { PROSE_CLASSES } from '@/lib/article-layout'

interface ArticleBodyProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper for article content with consistent prose styling.
 * Use this on essay pages; TiptapEditor imports PROSE_CLASSES directly.
 * 
 * Customize appearance in lib/article-layout.ts
 */
export function ArticleBody({ children, className }: ArticleBodyProps) {
  return (
    <div className={cn(PROSE_CLASSES, className)}>
      {children}
    </div>
  )
}
