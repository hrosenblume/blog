import { prisma } from '@/lib/db'
import { HOMEPAGE } from '@/lib/homepage'
import { SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/metadata'
import type { Post, SiteSettings, PageSettings } from '@prisma/client'

/**
 * Get site settings with defaults (upserts if not exists)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteTitle: '',
      siteTitleTemplate: '%s | {name}',
      siteDescription: '',
      siteKeywords: '',
      twitterHandle: '',
      orgName: '',
      orgLogo: '',
      orgSameAs: '[]',
    },
  })
}

/**
 * Get effective site title with fallback to HOMEPAGE.name
 */
export function getEffectiveSiteTitle(settings: SiteSettings): string {
  return settings.siteTitle || HOMEPAGE.name
}

/**
 * Get effective site description with fallback
 */
export function getEffectiveSiteDescription(settings: SiteSettings): string {
  return settings.siteDescription || SITE_DESCRIPTION
}

/**
 * Get effective site keywords with fallback
 */
export function getEffectiveSiteKeywords(settings: SiteSettings): string[] {
  const keywords = settings.siteKeywords?.trim()
  if (keywords) {
    return keywords.split(',').map(k => k.trim()).filter(Boolean)
  }
  return SITE_KEYWORDS
}

/**
 * Get effective title template, replacing {name} with HOMEPAGE.name
 */
export function getTitleTemplate(settings: SiteSettings): string {
  const template = settings.siteTitleTemplate || '%s | {name}'
  return template.replace('{name}', HOMEPAGE.name)
}

/**
 * Get effective SEO values for a post with fallbacks
 */
export function getPostSeoValues(
  post: Post,
  settings?: SiteSettings
): {
  title: string
  description: string
  keywords: string[]
} {
  // Title: seoTitle -> post title
  const title = post.seoTitle || post.title

  // Description: seoDescription -> subtitle -> truncated markdown
  let description = post.seoDescription || post.subtitle || ''
  if (!description && post.markdown) {
    // Strip markdown and truncate
    const rawText = post.markdown.replace(/[#*_\[\]]/g, '').trim()
    description = rawText.length <= 160
      ? rawText
      : rawText.slice(0, 157).replace(/\s+\S*$/, '') + '...'
  }

  // Keywords: seoKeywords -> empty
  const keywords = post.seoKeywords
    ? post.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
    : []

  return { title, description, keywords }
}

/**
 * Parse social URLs from settings (orgSameAs is stored as JSON string)
 */
export function getOrgSocialUrls(settings: SiteSettings): string[] {
  try {
    const urls = JSON.parse(settings.orgSameAs || '[]')
    return Array.isArray(urls) ? urls : []
  } catch {
    return []
  }
}

/**
 * Get organization name with fallback to HOMEPAGE.name
 */
export function getOrgName(settings: SiteSettings): string {
  return settings.orgName || HOMEPAGE.name
}

/**
 * Get page-specific SEO settings by page ID
 * Returns null if no custom settings exist for this page
 */
export async function getPageSettings(pageId: string): Promise<PageSettings | null> {
  return prisma.pageSettings.findUnique({
    where: { id: pageId },
  })
}

/**
 * Get effective SEO values for a static page with fallbacks
 */
export async function getPageSeoValues(
  pageId: string,
  defaults: { title: string; description: string }
): Promise<{
  title: string
  description: string
  keywords: string[]
  noIndex: boolean
}> {
  const pageSettings = await getPageSettings(pageId)
  
  return {
    title: pageSettings?.title || defaults.title,
    description: pageSettings?.description || defaults.description,
    keywords: pageSettings?.keywords
      ? pageSettings.keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [],
    noIndex: pageSettings?.noIndex || false,
  }
}
