/**
 * Client-side URL extraction utilities
 * Calls /api/extract for server-side content fetching
 * 
 * NOTE: This file must NOT import from lib/extract.ts (server-only due to JSDOM)
 */

import type { ExtractedContent } from '@/app/api/extract/route'

// Duplicate the regex here to avoid importing from server-only module
const URL_REGEX = /https?:\/\/[^\s<>"']+/gi

/**
 * Extract URLs from text content
 * Returns deduplicated URLs, limited to 3
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || []
  // Dedupe and limit to 3
  return Array.from(new Set(matches)).slice(0, 3)
}

/**
 * Fetch and extract content from URLs via the /api/extract endpoint
 */
export async function fetchUrlContent(urls: string[]): Promise<ExtractedContent[]> {
  if (!urls.length) return []

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })

    if (!res.ok) return []
    return res.json()
  } catch {
    // Silently fail - URL extraction is not critical
    return []
  }
}

export type { ExtractedContent }
