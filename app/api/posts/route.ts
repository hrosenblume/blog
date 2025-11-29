import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withSession, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'

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
  const { title, subtitle, slug, markdown, polyhedraShape, status } = await request.json()

  if (!title?.trim()) return badRequest('Title is required')
  if (!slug?.trim()) return badRequest('Slug is required')

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) return badRequest(`Slug "${slug}" already exists`)

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      slug: slug.trim(),
      markdown: markdown ?? '',
      polyhedraShape: polyhedraShape || null,
      status: status ?? 'draft',
      publishedAt: status === 'published' ? new Date() : null,
      revisions: { 
        create: { 
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          markdown: markdown ?? '',
          polyhedraShape: polyhedraShape || null,
        } 
      },
    },
  })

  // Invalidate homepage cache
  revalidatePath('/')

  return NextResponse.json({ id: post.id, slug: post.slug, status: post.status })
})
