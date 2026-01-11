/**
 * Shared URL extraction utilities (server-side)
 * Used by both /api/extract and /api/ai/generate
 */

import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export interface ExtractedContent {
  url: string
  title?: string
  content?: string
  excerpt?: string
  error?: string
}

// Shared URL regex - matches http/https URLs
export const URL_REGEX = /https?:\/\/[^\s<>"']+/gi

const MAX_URLS = 3
const FETCH_TIMEOUT = 10000 // 10 seconds
const MAX_CONTENT_LENGTH = 4000 // Limit extracted content to avoid token bloat

/**
 * Extract URLs from text content
 * Returns deduplicated URLs, limited to MAX_URLS
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || []
  // Dedupe and limit
  return Array.from(new Set(matches)).slice(0, MAX_URLS)
}

/**
 * Validate that a string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Extract readable content from a single URL
 * Server-side only - uses JSDOM and Readability
 */
export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  try {
    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return { url, error: `HTTP ${response.status}` }
    }

    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return { url, error: 'Not an HTML page' }
    }

    const html = await response.text()

    // Parse with jsdom and Readability
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      return { url, error: 'Could not extract content' }
    }

    // Truncate content if too long
    let content = article.textContent || ''
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.slice(0, MAX_CONTENT_LENGTH) + '...'
    }

    return {
      url,
      title: article.title || undefined,
      content: content.trim(),
      excerpt: article.excerpt || undefined,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { url, error: message }
  }
}

/**
 * Extract readable content from multiple URLs in parallel
 * Filters invalid URLs automatically
 */
export async function extractFromUrls(urls: string[]): Promise<ExtractedContent[]> {
  const validUrls = urls.filter(isValidUrl).slice(0, MAX_URLS)
  return Promise.all(validUrls.map(extractFromUrl))
}

/**
 * Extract URLs from text and fetch their content
 * Returns the original text enriched with extracted content
 */
export async function enrichTextWithUrls(text: string): Promise<string> {
  const urls = extractUrls(text)
  if (urls.length === 0) return text

  const extracted = await extractFromUrls(urls)
  let enriched = text

  for (const item of extracted) {
    if (item.content) {
      const title = item.title ? `${item.title}\n` : ''
      enriched += `\n\n[Content from ${item.url}]:\n${title}${item.content}`
    }
  }

  return enriched
}
