import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { extractFromUrls, type ExtractedContent } from '@/lib/extract'

interface ExtractRequest {
  urls: string[]
}

// Re-export the type for client-side usage
export type { ExtractedContent }

// POST /api/extract - Extract readable content from URLs
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: ExtractRequest = await request.json()

  if (!body.urls?.length) {
    return badRequest('URLs are required')
  }

  const results = await extractFromUrls(body.urls)
  return NextResponse.json(results)
}
