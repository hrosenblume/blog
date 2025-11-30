import { headers } from 'next/headers'

// ============================================
// METADATA CONFIGURATION
// Central config for all social/SEO metadata
// ============================================

/**
 * Hybrid base URL detection:
 * - Production: Uses NEXT_PUBLIC_BASE_URL env var
 * - Dev/Testing: Auto-detects from request headers (ngrok, localhost, etc.)
 */
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

// OpenGraph image constants
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_SIZE_SQUARE = { width: 128, height: 128 }  // For compact social previews (iMessage, etc.)
export const OG_CONTENT_TYPE = 'image/png'
export const OG_FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

// OpenGraph image styling (edit these to change social preview appearance)
export const OG_STYLE = {
  bgColor: '#2d2d2d',           // Dark charcoal background
  textColor: '#ffffff',          // White text
  subtitleColor: '#888888',      // Gray subtitle
  defaultShape: 'cube',          // Default polyhedra shape for homepage
}

// Site metadata
export const SITE_DESCRIPTION = 'Essays on startups, building, and life.'
export const SITE_KEYWORDS = ['essays', 'blog', 'startups', 'building', 'writing']
export const TWITTER_HANDLE = '@hrosenblume'

