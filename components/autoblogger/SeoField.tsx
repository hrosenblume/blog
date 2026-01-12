'use client'

import { SeoSection } from './SeoSection'

interface SeoFieldProps {
  value: unknown
  onChange: (value: unknown) => void
  onFieldChange: (name: string, value: unknown) => void
  post: {
    title: string
    subtitle?: string | null
    slug: string
    seoTitle?: string | null
    seoDescription?: string | null
    seoKeywords?: string | null
    noIndex?: boolean
    ogImage?: string | null
    polyhedraShape?: string | null
    [key: string]: unknown
  }
  disabled?: boolean
}

export function SeoField({
  onFieldChange,
  post,
  disabled = false,
}: SeoFieldProps) {
  return (
    <SeoSection
      seoTitle={post.seoTitle || ''}
      seoDescription={post.seoDescription || ''}
      seoKeywords={post.seoKeywords || ''}
      noIndex={post.noIndex || false}
      ogImage={post.ogImage || ''}
      polyhedraShape={post.polyhedraShape || 'tetrahedron'}
      postTitle={post.title}
      postSubtitle={post.subtitle || ''}
      slug={post.slug}
      onSeoTitleChange={(value) => onFieldChange('seoTitle', value || null)}
      onSeoDescriptionChange={(value) => onFieldChange('seoDescription', value || null)}
      onSeoKeywordsChange={(value) => onFieldChange('seoKeywords', value || null)}
      onNoIndexChange={(value) => onFieldChange('noIndex', value)}
      onOgImageChange={(value) => onFieldChange('ogImage', value || null)}
      disabled={disabled}
    />
  )
}
