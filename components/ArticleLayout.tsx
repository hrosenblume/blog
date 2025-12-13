import { cn } from '@/lib/utils/cn'
import { CONTENT_WIDTH, CONTENT_PADDING } from '@/lib/article-layout'

// Re-export for pages that need direct access
export { CONTENT_WIDTH, CONTENT_PADDING } from '@/lib/article-layout'

interface ArticleLayoutProps {
  /** ArticleHeader component (editable or read-only) */
  header: React.ReactNode
  /** Body content (ArticleBody for essays, TiptapEditor for editor) */
  children: React.ReactNode
  /** Optional footer slot (PostMetadataFooter in editor) */
  footer?: React.ReactNode
  /** Include width/padding container (true for editor, false when inside PageContainer) */
  withContainer?: boolean
  className?: string
}

/**
 * Unified layout wrapper for article content.
 * Used by both essay pages and the editor to ensure consistent structure.
 * 
 * Set withContainer={true} when not inside a PageContainer (e.g., editor page).
 * 
 * Customize appearance in lib/article-layout.ts
 */
export function ArticleLayout({ 
  header, 
  children, 
  footer, 
  withContainer = false,
  className 
}: ArticleLayoutProps) {
  const containerClasses = withContainer 
    ? cn(CONTENT_WIDTH, 'mx-auto', CONTENT_PADDING, className)
    : className

  return (
    <article className={containerClasses}>
      {header}
      {children}
      {footer}
    </article>
  )
}






