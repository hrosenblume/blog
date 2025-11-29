import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withSession, notFound, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'

// GET /api/posts/by-slug/[slug] - Get single post by slug
export const GET = withSession(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return notFound()

  // Get adjacent posts (same status, ordered by updatedAt desc)
  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { 
        status: post.status,
        updatedAt: { gt: post.updatedAt },
      },
      orderBy: { updatedAt: 'asc' },
      select: { slug: true },
    }),
    prisma.post.findFirst({
      where: { 
        status: post.status,
        updatedAt: { lt: post.updatedAt },
      },
      orderBy: { updatedAt: 'desc' },
      select: { slug: true },
    }),
  ])

  return NextResponse.json({
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    markdown: post.markdown,
    polyhedraShape: post.polyhedraShape,
    status: post.status,
    wordCount: wordCount(post.markdown),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    prevSlug: prev?.slug ?? null,
    nextSlug: next?.slug ?? null,
  })
})

// PATCH /api/posts/by-slug/[slug] - Update post by slug
export const PATCH = withSession(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
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

  if (data.subtitle !== undefined) {
    updates.subtitle = data.subtitle || null
  }

  if (data.polyhedraShape !== undefined) {
    updates.polyhedraShape = data.polyhedraShape
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

  const updated = await prisma.post.update({ where: { id: post.id }, data: updates })
  
  // Invalidate homepage and essay page caches
  revalidatePath('/')
  revalidatePath(`/e/${updated.slug}`)
  
  return NextResponse.json({ id: updated.id, slug: updated.slug, status: updated.status })
})

// DELETE /api/posts/by-slug/[slug] - Soft delete post (sets status to 'deleted')
export const DELETE = withSession(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return notFound()

  await prisma.post.update({ where: { id: post.id }, data: { status: 'deleted' } })
  
  // Invalidate homepage cache
  revalidatePath('/')
  
  return NextResponse.json({ success: true })
})

