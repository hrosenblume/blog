'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { OgImageUpload } from '@/components/admin/OgImageUpload'
import { SocialPreviews } from '@/components/admin/SocialPreviews'

interface SeoSectionProps {
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  noIndex: boolean
  ogImage: string
  polyhedraShape: string
  postTitle: string
  postSubtitle: string
  slug: string
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  onNoIndexChange: (value: boolean) => void
  onOgImageChange: (value: string) => void
  disabled?: boolean
}

export function SeoSection({
  seoTitle,
  seoDescription,
  seoKeywords,
  noIndex,
  ogImage,
  polyhedraShape,
  postTitle,
  postSubtitle,
  slug,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onNoIndexChange,
  onOgImageChange,
  disabled = false,
}: SeoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate effective values (what will actually be shown in search)
  const effectiveTitle = seoTitle || postTitle || 'Untitled'
  const effectiveDescription = seoDescription || postSubtitle || ''
  
  // Polyhedra thumbnail is the default social image for essays
  const polyhedraImageUrl = `/polyhedra/thumbnails/${polyhedraShape}.png`

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span>SEO Settings</span>
        {(seoTitle || seoDescription || seoKeywords || noIndex || ogImage) && (
          <span className="ml-auto text-xs text-muted-foreground">customized</span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 pl-6">
          {/* SEO Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seoTitle" className="text-xs text-muted-foreground">
                Title
              </Label>
              <span className={`text-xs ${seoTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {seoTitle.length}/60
              </span>
            </div>
            <Input
              id="seoTitle"
              value={seoTitle}
              onChange={e => onSeoTitleChange(e.target.value)}
              placeholder={postTitle || 'Custom search title...'}
              disabled={disabled}
              className="text-sm h-8"
            />
          </div>

          {/* SEO Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seoDescription" className="text-xs text-muted-foreground">
                Description
              </Label>
              <span className={`text-xs ${seoDescription.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {seoDescription.length}/160
              </span>
            </div>
            <Textarea
              id="seoDescription"
              value={seoDescription}
              onChange={e => onSeoDescriptionChange(e.target.value)}
              placeholder={postSubtitle || 'Custom meta description...'}
              disabled={disabled}
              className="text-sm min-h-[60px] resize-none"
            />
          </div>

          {/* SEO Keywords */}
          <div className="space-y-1.5">
            <Label htmlFor="seoKeywords" className="text-xs text-muted-foreground">
              Keywords
            </Label>
            <Input
              id="seoKeywords"
              value={seoKeywords}
              onChange={e => onSeoKeywordsChange(e.target.value)}
              placeholder="startup, essay, building (comma-separated)"
              disabled={disabled}
              className="text-sm h-8"
            />
          </div>

          {/* No Index */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="noIndex"
              checked={noIndex}
              onChange={e => onNoIndexChange(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="noIndex" className="text-xs text-muted-foreground cursor-pointer">
              Exclude from search engines (noindex)
            </Label>
          </div>

          {/* OG Image */}
          <div className="pt-2">
            <OgImageUpload
              value={ogImage}
              onChange={onOgImageChange}
              disabled={disabled}
              label="Social Preview Image"
            />
          </div>

          {/* SERP Preview */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Search Preview</p>
            <div className="border border-border rounded-md p-3 bg-muted/30">
              <div className="text-sm text-blue-600 dark:text-blue-400 truncate">
                {effectiveTitle} | Hunter Rosenblume
              </div>
              <div className="text-xs text-green-700 dark:text-green-500 truncate mt-0.5">
                example.com/e/{slug || 'post-slug'}
              </div>
              {effectiveDescription && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {effectiveDescription}
                </div>
              )}
            </div>
          </div>

          {/* Social Previews */}
          <SocialPreviews
            title={effectiveTitle}
            description={effectiveDescription}
            imageUrl={ogImage || polyhedraImageUrl}
            url={`yourdomain.com/e/${slug || 'post-slug'}`}
          />
        </div>
      )}
    </div>
  )
}
