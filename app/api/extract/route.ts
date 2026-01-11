import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

interface ExtractRequest {
  urls: string[]
}

export interface ExtractedContent {
  url: string
  title?: string
  content?: string
  excerpt?: string
  error?: string
}

const MAX_URLS = 3
const FETCH_TIMEOUT = 10000 // 10 seconds
const MAX_CONTENT_LENGTH = 4000 // Limit extracted content to avoid token bloat

// POST /api/extract - Extract readable content from URLs
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: ExtractRequest = await request.json()

  if (!body.urls?.length) {
    return badRequest('URLs are required')
  }

  // Limit number of URLs
  const urls = body.urls.slice(0, MAX_URLS)

  // Validate URLs
  const validUrls = urls.filter((url) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  })

  // Extract content from each URL in parallel
  const results = await Promise.all(
    validUrls.map(async (url): Promise<ExtractedContent> => {
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
    })
  )

  return NextResponse.json(results)
}
