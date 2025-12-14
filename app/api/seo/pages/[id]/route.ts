import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin } from '@/lib/auth'
import { getSeoPageById } from '@/lib/seo-pages'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/seo/pages/[id]
 * Get settings for a specific page
 */
export const GET = withAdmin(async (req: NextRequest, context: RouteContext) => {
  const { id } = await context.params
  
  const pageConfig = getSeoPageById(id)
  if (!pageConfig) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  const settings = await prisma.pageSettings.findUnique({
    where: { id },
  })

  return NextResponse.json({
    ...pageConfig,
    title: settings?.title || null,
    description: settings?.description || null,
    keywords: settings?.keywords || null,
    noIndex: settings?.noIndex || false,
    updatedAt: settings?.updatedAt || null,
  })
})

/**
 * PATCH /api/seo/pages/[id]
 * Update settings for a specific page
 */
export const PATCH = withAdmin(async (req: NextRequest, context: RouteContext) => {
  const { id } = await context.params
  
  const pageConfig = getSeoPageById(id)
  if (!pageConfig) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  const body = await req.json()
  const { title, description, keywords, noIndex } = body

  const settings = await prisma.pageSettings.upsert({
    where: { id },
    update: {
      title: title || null,
      description: description || null,
      keywords: keywords || null,
      noIndex: noIndex || false,
    },
    create: {
      id,
      path: pageConfig.path,
      title: title || null,
      description: description || null,
      keywords: keywords || null,
      noIndex: noIndex || false,
    },
  })

  return NextResponse.json(settings)
})
