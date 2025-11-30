import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withSession, notFound, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { getRandomShape } from '@/lib/polyhedra/shapes'

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

  // Check if any revision-tracked fields changed
  const newTitle = (updates.title as string) ?? post.title
  const newSubtitle = (updates.subtitle as string | null) ?? post.subtitle
  const newMarkdown = (updates.markdown as string) ?? post.markdown
  const newPolyhedraShape = (updates.polyhedraShape as string | null) ?? post.polyhedraShape

  const hasContentChanges = 
    newTitle !== post.title ||
    newSubtitle !== post.subtitle ||
    newMarkdown !== post.markdown ||
    newPolyhedraShape !== post.polyhedraShape

  if (hasContentChanges) {
    await prisma.revision.create({
      data: {
        postId: post.id,
        title: newTitle,
        subtitle: newSubtitle,
        markdown: newMarkdown,
        polyhedraShape: newPolyhedraShape,
      }
    })
  }

  const updated = await prisma.post.update({ where: { id }, data: updates })

  // Revalidate cached pages so changes appear immediately
  revalidatePath('/')
  revalidatePath(`/e/${updated.slug}`)
  if (updates.slug && updates.slug !== post.slug) {
    revalidatePath(`/e/${post.slug}`)
  }

  return NextResponse.json({ id: updated.id, slug: updated.slug, status: updated.status })
})

// DELETE /api/posts/[id] - Soft delete post (sets status to 'deleted')
export const DELETE = withSession(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return notFound()

  await prisma.post.update({ where: { id }, data: { status: 'deleted' } })

  // Revalidate cached pages
  revalidatePath('/')
  revalidatePath(`/e/${post.slug}`)

  return NextResponse.json({ success: true })
})
