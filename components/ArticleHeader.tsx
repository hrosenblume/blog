import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import {
  TITLE_CLASSES,
  SUBTITLE_CLASSES,
  BYLINE_CLASSES,
  HEADER_SPACING,
  BYLINE_MARGIN,
  INPUT_CLASSES,
} from '@/lib/article-layout'

interface ArticleHeaderProps {
  title: string
  subtitle?: string
  byline?: string
  bylineHref?: string
  editable?: boolean
  disabled?: boolean
  onTitleChange?: (value: string) => void
  onSubtitleChange?: (value: string) => void
  className?: string
}

/**
 * Unified header component for essays and editor.
 * Use editable={true} in the editor to render inputs instead of headings.
 * Styling is shared between modes for WYSIWYG parity.
 * 
 * Customize appearance in lib/article-layout.ts
 */
export function ArticleHeader({
  title,
  subtitle,
  byline,
  bylineHref,
  editable = false,
  disabled = false,
  onTitleChange,
  onSubtitleChange,
  className,
}: ArticleHeaderProps) {
  // Byline renders as link when href provided, otherwise plain text
  // Wrapped in div to control spacing independently from header spacing
  const bylineElement = byline ? (
    <div className={BYLINE_MARGIN}>
      {bylineHref ? (
        <Link 
          href={bylineHref} 
          className={cn(BYLINE_CLASSES, 'hover:text-foreground transition-colors')}
        >
          {byline}
        </Link>
      ) : (
        <span className={BYLINE_CLASSES}>{byline}</span>
      )}
    </div>
  ) : null

  if (editable) {
    return (
      <header className={cn(HEADER_SPACING, className)}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title"
          disabled={disabled}
          className={cn(TITLE_CLASSES, INPUT_CLASSES, disabled && 'cursor-not-allowed opacity-60')}
        />
        <input
          type="text"
          value={subtitle ?? ''}
          onChange={(e) => onSubtitleChange?.(e.target.value)}
          placeholder="Subtitle (shown on homepage)"
          disabled={disabled}
          className={cn(SUBTITLE_CLASSES, INPUT_CLASSES, disabled && 'cursor-not-allowed opacity-60')}
        />
        {bylineElement}
      </header>
    )
  }

  return (
    <header className={cn(HEADER_SPACING, className)}>
      <h1 className={TITLE_CLASSES}>{title}</h1>
      {subtitle && <p className={SUBTITLE_CLASSES}>{subtitle}</p>}
      {bylineElement}
    </header>
  )
}

