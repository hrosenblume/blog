import { NextRequest, NextResponse } from 'next/server'
import { withSession, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { createPost } from '@/lib/posts'

// GET /api/posts - List all posts (excludes deleted)
export const GET = withSession(async () => {
  const posts = await prisma.post.findMany({
    where: { status: { not: 'deleted' } },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, slug: true, status: true, markdown: true, updatedAt: true, publishedAt: true },
  })

  return NextResponse.json({
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      wordCount: wordCount(post.markdown),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
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
