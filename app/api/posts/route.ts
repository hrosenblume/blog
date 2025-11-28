import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'

// GET /api/posts - List all posts
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      markdown: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
    },
  })

  return NextResponse.json({
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      wordCount: wordCount(post.markdown),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() || null,
    })),
  })
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const { title, slug, markdown, status } = data

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  // Check for duplicate slug
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      slug: slug.trim(),
      markdown: markdown || '',
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null,
      revisions: {
        create: { markdown: markdown || '' },
      },
    },
  })

  return NextResponse.json({
    id: post.id,
    slug: post.slug,
    status: post.status,
  })
}

