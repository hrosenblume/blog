import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/seo/settings - Get current site SEO settings
export const GET = withSession(async () => {
  // Upsert to ensure settings always exist
  const settings = await prisma.siteSettings.upsert({
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

  return NextResponse.json({
    siteTitle: settings.siteTitle,
    siteTitleTemplate: settings.siteTitleTemplate,
    siteDescription: settings.siteDescription,
    siteKeywords: settings.siteKeywords,
    twitterHandle: settings.twitterHandle,
    orgName: settings.orgName,
    orgLogo: settings.orgLogo,
    orgSameAs: settings.orgSameAs,
  })
})

// PATCH /api/seo/settings - Update site SEO settings
export const PATCH = withSession(async (request: NextRequest) => {
  const body = await request.json()
  
  const updateData: {
    siteTitle?: string
    siteTitleTemplate?: string
    siteDescription?: string
    siteKeywords?: string
    twitterHandle?: string
    orgName?: string
    orgLogo?: string
    orgSameAs?: string
  } = {}

  if (typeof body.siteTitle === 'string') {
    updateData.siteTitle = body.siteTitle
  }

  if (typeof body.siteTitleTemplate === 'string') {
    updateData.siteTitleTemplate = body.siteTitleTemplate
  }

  if (typeof body.siteDescription === 'string') {
    updateData.siteDescription = body.siteDescription
  }

  if (typeof body.siteKeywords === 'string') {
    updateData.siteKeywords = body.siteKeywords
  }

  if (typeof body.twitterHandle === 'string') {
    updateData.twitterHandle = body.twitterHandle
  }

  if (typeof body.orgName === 'string') {
    updateData.orgName = body.orgName
  }

  if (typeof body.orgLogo === 'string') {
    updateData.orgLogo = body.orgLogo
  }

  if (typeof body.orgSameAs === 'string') {
    // Validate JSON array
    try {
      JSON.parse(body.orgSameAs)
      updateData.orgSameAs = body.orgSameAs
    } catch {
      return NextResponse.json(
        { error: 'orgSameAs must be a valid JSON array' },
        { status: 400 }
      )
    }
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      siteTitle: updateData.siteTitle || '',
      siteTitleTemplate: updateData.siteTitleTemplate || '%s | {name}',
      siteDescription: updateData.siteDescription || '',
      siteKeywords: updateData.siteKeywords || '',
      twitterHandle: updateData.twitterHandle || '',
      orgName: updateData.orgName || '',
      orgLogo: updateData.orgLogo || '',
      orgSameAs: updateData.orgSameAs || '[]',
    },
  })

  return NextResponse.json({
    siteTitle: settings.siteTitle,
    siteTitleTemplate: settings.siteTitleTemplate,
    siteDescription: settings.siteDescription,
    siteKeywords: settings.siteKeywords,
    twitterHandle: settings.twitterHandle,
    orgName: settings.orgName,
    orgLogo: settings.orgLogo,
    orgSameAs: settings.orgSameAs,
  })
})
