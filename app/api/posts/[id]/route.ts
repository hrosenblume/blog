import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { getRandomShape } from '@/lib/polyhedra/shapes'

// GET /api/posts/[id] - Get single post
export const GET = withSession(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
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
export const PATCH = withSession(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return notFound()

  const data = await request.json()
  const updates: Record<string, unknown> = {}

  if (data.title !== undefined) {
    if (!data.title.trim()) return badRequest('Title is required')
    updates.title = data.title.trim()
  }

  if (data.slug !== undefined) {
    if (!data.slug.trim()) return badRequest('Slug is required')
    if (data.slug !== post.slug) {
      const existing = await prisma.post.findUnique({ where: { slug: data.slug } })
      if (existing) return badRequest(`Slug "${data.slug}" already exists`)
    }
    updates.slug = data.slug.trim()
  }

  if (data.markdown !== undefined) {
    updates.markdown = data.markdown
    if (data.markdown !== post.markdown) {
      await prisma.revision.create({ data: { postId: post.id, markdown: data.markdown } })
    }
  }

  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'published' && !post.publishedAt) updates.publishedAt = new Date()
  }

  // Assign polyhedra shape on first publish
  const isFirstPublish = data.status === 'published' && !post.publishedAt && !post.polyhedraShape
  if (isFirstPublish) {
    updates.polyhedraShape = getRandomShape()
  }

  const updated = await prisma.post.update({ where: { id: params.id }, data: updates })
  return NextResponse.json({ id: updated.id, slug: updated.slug, status: updated.status })
})

// DELETE /api/posts/[id] - Soft delete post (sets status to 'deleted')
export const DELETE = withSession(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return notFound()

  await prisma.post.update({ where: { id: params.id }, data: { status: 'deleted' } })
  return NextResponse.json({ success: true })
})
