import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound, badRequest, requireSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { updatePostWithAuth, deletePost } from '@/lib/posts'

// GET /api/posts/[id] - Get single post
export const GET = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true }
      }
    }
  })
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
    tags: post.tags.map(pt => ({ id: pt.tag.id, name: pt.tag.name })),
  })
})

// PATCH /api/posts/[id] - Update post
export const PATCH = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return notFound()

  const body = await request.json()
  const session = await requireSession()
  
  const result = await updatePostWithAuth(post, body, session?.user?.role)
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
