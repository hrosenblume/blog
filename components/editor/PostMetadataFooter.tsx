'use client'

import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { LockIcon } from '@/components/Icons'
import { wordCount } from '@/lib/markdown'
import { SeoSection } from './SeoSection'

interface PostMetadataFooterProps {
  slug: string
  status: 'draft' | 'published'
  polyhedraShape: string
  markdown: string
  title: string
  subtitle: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  noIndex: boolean
  ogImage: string
  onSlugChange: (slug: string) => void
  onShapeRegenerate: () => void
  onUnpublish: () => void
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  onNoIndexChange: (value: boolean) => void
  onOgImageChange: (value: string) => void
  disabled?: boolean
}

export function PostMetadataFooter({
  slug,
  status,
  polyhedraShape,
  markdown,
  title,
  subtitle,
  seoTitle,
  seoDescription,
  seoKeywords,
  noIndex,
  ogImage,
  onSlugChange,
  onShapeRegenerate,
  onUnpublish,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onNoIndexChange,
  onOgImageChange,
  disabled = false,
}: PostMetadataFooterProps) {
  const words = wordCount(markdown)
  const isPublished = status === 'published'

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
      {/* URL */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-14">URL</span>
          <span className="text-gray-400">/e/</span>
          {isPublished ? (
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              {slug}
              <LockIcon className="text-gray-400" />
            </span>
          ) : (
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="post-slug"
              className="flex-1 bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 dark:text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Shape */}
      <div className="flex items-center justify-between text-sm gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground w-14 flex-shrink-0">Shape</span>
          <div className="flex items-center gap-2 min-w-0">
            <PolyhedraCanvas shape={polyhedraShape} size={36} />
            <span
              className="text-muted-foreground font-mono text-xs truncate max-w-[100px] md:max-w-none"
              title={polyhedraShape}
            >
              {polyhedraShape}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onShapeRegenerate}
          className="flex-shrink-0 px-2.5 py-1 text-xs rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Regenerate
        </button>
      </div>

      {/* Status */}
      {isPublished && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-14">Status</span>
            <span className="text-green-600 dark:text-green-400">Published</span>
          </div>
          <button
            type="button"
            onClick={onUnpublish}
            className="px-2.5 py-1 text-xs rounded bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            Unpublish
          </button>
        </div>
      )}

      {/* SEO Section */}
      <SeoSection
        seoTitle={seoTitle}
        seoDescription={seoDescription}
        seoKeywords={seoKeywords}
        noIndex={noIndex}
        ogImage={ogImage}
        polyhedraShape={polyhedraShape}
        postTitle={title}
        postSubtitle={subtitle}
        slug={slug}
        onSeoTitleChange={onSeoTitleChange}
        onSeoDescriptionChange={onSeoDescriptionChange}
        onSeoKeywordsChange={onSeoKeywordsChange}
        onNoIndexChange={onNoIndexChange}
        onOgImageChange={onOgImageChange}
        disabled={disabled}
      />

      {/* Word count */}
      <div className="text-sm text-muted-foreground pt-2 border-t border-border">
        {words.toLocaleString()} words · ~{Math.ceil(words / 200)} min read
      </div>
    </div>
  )
}

