'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
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
  /** When true and title/subtitle are empty, shows skeleton placeholders */
  generating?: boolean
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
  generating = false,
  onTitleChange,
  onSubtitleChange,
  className,
}: ArticleHeaderProps) {
  const subtitleRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize subtitle textarea to fit content
  useEffect(() => {
    const textarea = subtitleRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [subtitle])

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
    // Show skeletons when generating and content hasn't arrived yet
    const showTitleSkeleton = generating && !title
    const showSubtitleSkeleton = generating && !subtitle
    const showBylineSkeleton = generating && !title && !subtitle

    return (
      <header className={cn(HEADER_SPACING, className)}>
        {showTitleSkeleton ? (
          <Skeleton className="h-8 w-4/5" />
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Title"
            disabled={disabled || generating}
            className={cn(TITLE_CLASSES, INPUT_CLASSES, (disabled || generating) && 'cursor-not-allowed opacity-60')}
          />
        )}
        {showSubtitleSkeleton ? (
          <Skeleton className="h-5 w-3/5" />
        ) : (
          <textarea
            ref={subtitleRef}
            value={subtitle ?? ''}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
            onKeyDown={(e) => {
              // Prevent Enter from creating newlines - subtitles should be single paragraph
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
            placeholder="Subtitle (shown on homepage)"
            disabled={disabled || generating}
            rows={1}
            className={cn(SUBTITLE_CLASSES, INPUT_CLASSES, 'resize-none overflow-hidden', (disabled || generating) && 'cursor-not-allowed opacity-60')}
          />
        )}
        {showBylineSkeleton ? (
          <div className={BYLINE_MARGIN}>
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          bylineElement
        )}
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

