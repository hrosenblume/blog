import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound, badRequest, forbidden, requireSession, canPublish } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { updatePost, deletePost } from '@/lib/posts'

// GET /api/posts/[id] - Get single post
export const GET = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return notFound()

  return NextResponse.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    markdown: post.markdown,
    status: post.status,
    wordCount: wordCount(post.markdown),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
  })
})

// PATCH /api/posts/[id] - Update post
export const PATCH = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return notFound()

  const body = await request.json()
  
  // Check if user can publish (drafters cannot)
  if (body.status === 'published') {
    const session = await requireSession()
    if (!canPublish(session?.user?.role)) return forbidden()
  }

  const result = await updatePost(post, body)
  if (!result.success) return badRequest(result.error)

  return NextResponse.json({ id: result.post.id, slug: result.post.slug, status: result.post.status })
})

// DELETE /api/posts/[id] - Soft delete post (sets status to 'deleted')
export const DELETE = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const result = await deletePost(id)
  
  if (!result.success) return notFound()

  return NextResponse.json({ success: true })
})
