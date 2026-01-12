'use client'

import { useState, useRef } from 'react'
import { ChevronDown, X, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

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

/**
 * SEO metadata editing section for blog posts.
 * Includes SERP preview and fields for title, description, keywords, noindex, and OG image.
 */
export function SeoSection({
  seoTitle,
  seoDescription,
  seoKeywords,
  noIndex,
  ogImage,
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
  const [expanded, setExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 4MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await response.json()
      onOgImageChange(url)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleClearImage = () => {
    onOgImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Generate preview values
  const displayTitle = seoTitle || postTitle || 'Untitled'
  const displayDescription = seoDescription || postSubtitle || 'No description'
  const displayUrl = `example.com/e/${slug || 'untitled'}`
  
  return (
    <div className="border-t border-border pt-4 mt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <span>SEO Settings</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* SERP Preview */}
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="text-blue-600 dark:text-blue-400 truncate">{displayTitle}</p>
            <p className="text-green-600 dark:text-green-400 text-xs truncate">{displayUrl}</p>
            <p className="text-muted-foreground line-clamp-2">{displayDescription}</p>
          </div>
          
          {/* SEO Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder={postTitle || 'Page title'}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background disabled:opacity-50"
            />
          </div>
          
          {/* SEO Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Meta Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              placeholder={postSubtitle || 'Brief description for search engines'}
              disabled={disabled}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background resize-none disabled:opacity-50"
            />
          </div>
          
          {/* SEO Keywords */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Keywords</label>
            <input
              type="text"
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background disabled:opacity-50"
            />
          </div>
          
          {/* noIndex Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noIndex}
              onChange={(e) => onNoIndexChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-input"
            />
            <span>Hide from search engines (noindex)</span>
          </label>

          {/* OG Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">OG Image</label>
            
            {ogImage ? (
              // Image preview
              <div className="relative group">
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={ogImage}
                    alt="OG Preview"
                    className="w-full h-auto max-h-48 object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                  onClick={handleClearImage}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs text-muted-foreground mt-1 truncate">{ogImage}</p>
              </div>
            ) : (
              // Upload zone
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
                  ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleInputChange}
                  disabled={disabled || uploading}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-muted">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Drop image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 1200 x 630px (1.91:1 ratio)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, GIF, WebP · Max 4MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL input as fallback */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste image URL..."
                value={ogImage}
                onChange={(e) => onOgImageChange(e.target.value)}
                disabled={disabled || uploading}
                className="w-full px-3 py-2 text-xs border border-input rounded-md bg-background disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
