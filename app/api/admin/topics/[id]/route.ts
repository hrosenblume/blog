import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, badRequest, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/topics/[id] - Get single topic
export const GET = withAdmin(async (_request: NextRequest, context: RouteContext) => {
  const { id } = await context.params

  const topic = await prisma.topicSubscription.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          newsItems: true,
          posts: true,
        },
      },
    },
  })

  if (!topic) return notFound()

  return NextResponse.json({
    ...topic,
    newsItemCount: topic._count.newsItems,
    postCount: topic._count.posts,
    _count: undefined,
  })
})

// PATCH /api/admin/topics/[id] - Update topic
export const PATCH = withAdmin(async (request: NextRequest, context: RouteContext) => {
  const { id } = await context.params
  const data = await request.json()

  const existing = await prisma.topicSubscription.findUnique({ where: { id } })
  if (!existing) return notFound()

  const updates: Record<string, unknown> = {}

  if (data.name !== undefined) {
    if (!data.name.trim()) return badRequest('Name is required')
    updates.name = data.name.trim()
  }

  if (data.keywords !== undefined) {
    let keywords: string[] = []
    if (Array.isArray(data.keywords)) {
      keywords = data.keywords
    } else if (typeof data.keywords === 'string') {
      keywords = data.keywords.split('\n').map((k: string) => k.trim()).filter(Boolean)
    }
    updates.keywords = JSON.stringify(keywords)
  }

  if (data.rssFeeds !== undefined) {
    let rssFeeds: string[] = []
    if (Array.isArray(data.rssFeeds)) {
      rssFeeds = data.rssFeeds
    } else if (typeof data.rssFeeds === 'string') {
      rssFeeds = data.rssFeeds.split('\n').map((f: string) => f.trim()).filter(Boolean)
    }
    if (rssFeeds.length === 0) return badRequest('At least one RSS feed URL is required')
    updates.rssFeeds = JSON.stringify(rssFeeds)
  }

  if (data.isActive !== undefined) updates.isActive = data.isActive
  if (data.frequency !== undefined) updates.frequency = data.frequency
  if (data.maxPerPeriod !== undefined) updates.maxPerPeriod = data.maxPerPeriod
  if (data.essayFocus !== undefined) updates.essayFocus = data.essayFocus?.trim() || null

  const topic = await prisma.topicSubscription.update({
    where: { id },
    data: updates,
  })

  return NextResponse.json(topic)
})

// DELETE /api/admin/topics/[id] - Delete topic and its news items
export const DELETE = withAdmin(async (_request: NextRequest, context: RouteContext) => {
  const { id } = await context.params

  const existing = await prisma.topicSubscription.findUnique({ where: { id } })
  if (!existing) return notFound()

  // Delete topic (cascades to news items)
  await prisma.topicSubscription.delete({ where: { id } })

  return NextResponse.json({ success: true })
})


