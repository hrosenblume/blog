import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound, badRequest, requireSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'
import { updatePostWithAuth, deletePost } from '@/lib/posts'

// GET /api/posts/by-slug/[slug] - Get single post by slug
export const GET = withSession(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: {
        include: { tag: true }
      }
    }
  })
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
    // SEO fields
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    noIndex: post.noIndex,
    ogImage: post.ogImage,
    // Tags
    tags: post.tags.map(pt => ({ id: pt.tag.id, name: pt.tag.name })),
  })
})

// PATCH /api/posts/by-slug/[slug] - Update post by slug
export const PATCH = withSession(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) return notFound()

  const body = await request.json()
  const session = await requireSession()
  
  const result = await updatePostWithAuth(post, body, session?.user?.role)
  if (!result.success) return badRequest(result.error)

  return NextResponse.json({ id: result.post.id, slug: result.post.slug, status: result.post.status })
})

// DELETE /api/posts/by-slug/[slug] - Soft delete post (sets status to 'deleted')
export const DELETE = withSession(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) return notFound()

  const result = await deletePost(post)
  if (!result.success) return notFound()

  return NextResponse.json({ success: true })
})
