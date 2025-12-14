import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin } from '@/lib/auth'
import { seoPages } from '@/lib/seo-pages'

/**
 * GET /api/seo/pages
 * Returns all configurable pages with their current settings
 */
export const GET = withAdmin(async () => {
  // Get all existing page settings from DB
  const existingSettings = await prisma.pageSettings.findMany()
  const settingsMap = new Map(existingSettings.map(s => [s.id, s]))

  // Merge with config to include pages that don't have settings yet
  const pages = seoPages.map(page => {
    const settings = settingsMap.get(page.id)
    return {
      ...page,
      title: settings?.title || null,
      description: settings?.description || null,
      keywords: settings?.keywords || null,
      noIndex: settings?.noIndex || false,
      ogImage: settings?.ogImage || null,
      updatedAt: settings?.updatedAt || null,
    }
  })

  return NextResponse.json(pages)
})
