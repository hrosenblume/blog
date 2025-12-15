import { NextRequest, NextResponse } from 'next/server'
import { withSession, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { createPost } from '@/lib/posts'

// GET /api/posts - List all posts (excludes deleted, supports status filter)
export const GET = withSession(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  // Build where clause
  const where = statusFilter
    ? { status: statusFilter }
    : { status: { notIn: ['deleted', 'suggested'] } } // Default: exclude deleted and suggested

  const posts = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      status: true,
      markdown: true,
      updatedAt: true,
      publishedAt: true,
      createdAt: true,
      sourceUrl: true,
      topic: {
        select: { id: true, name: true },
      },
    },
  })

  return NextResponse.json({
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle,
      slug: post.slug,
      status: post.status,
      markdown: post.markdown,
      wordCount: wordCount(post.markdown),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      sourceUrl: post.sourceUrl,
      topic: post.topic,
    })),
  })
})

// POST /api/posts - Create new post
export const POST = withSession(async (request: NextRequest) => {
  const result = await createPost(await request.json())
  
  if (!result.success) {
    return badRequest(result.error)
  }

  return NextResponse.json({ id: result.post.id, slug: result.post.slug, status: result.post.status })
})
