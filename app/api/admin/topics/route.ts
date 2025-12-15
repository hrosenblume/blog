import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/topics - List all topics with stats
export const GET = withAdmin(async () => {
  const topics = await prisma.topicSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          newsItems: true,
          posts: true,
        },
      },
    },
  })

  // Transform to include stats
  const topicsWithStats = topics.map(topic => ({
    ...topic,
    newsItemCount: topic._count.newsItems,
    postCount: topic._count.posts,
    _count: undefined,
  }))

  return NextResponse.json(topicsWithStats)
})

// POST /api/admin/topics - Create a new topic
export const POST = withAdmin(async (request: NextRequest) => {
  const data = await request.json()

  if (!data.name?.trim()) {
    return badRequest('Name is required')
  }

  // Parse keywords and feeds (accept array or newline-separated string)
  let keywords: string[] = []
  if (Array.isArray(data.keywords)) {
    keywords = data.keywords
  } else if (typeof data.keywords === 'string') {
    keywords = data.keywords.split('\n').map((k: string) => k.trim()).filter(Boolean)
  }

  let rssFeeds: string[] = []
  if (Array.isArray(data.rssFeeds)) {
    rssFeeds = data.rssFeeds
  } else if (typeof data.rssFeeds === 'string') {
    rssFeeds = data.rssFeeds.split('\n').map((f: string) => f.trim()).filter(Boolean)
  }

  if (rssFeeds.length === 0) {
    return badRequest('At least one RSS feed URL is required')
  }

  const topic = await prisma.topicSubscription.create({
    data: {
      name: data.name.trim(),
      keywords: JSON.stringify(keywords),
      rssFeeds: JSON.stringify(rssFeeds),
      isActive: data.isActive ?? true,
      frequency: data.frequency ?? 'daily',
      maxPerPeriod: data.maxPerPeriod ?? 3,
      essayFocus: data.essayFocus?.trim() || null,
    },
  })

  return NextResponse.json(topic)
})


