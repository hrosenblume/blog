import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { wordCount } from '@/lib/markdown'

// GET /api/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  })

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    markdown: post.markdown,
    status: post.status,
    wordCount: wordCount(post.markdown),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() || null,
  })
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data = await request.json()
  const updates: Record<string, unknown> = {}

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    updates.title = data.title.trim()
  }

  if (data.slug !== undefined) {
    if (!data.slug.trim()) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }
    if (data.slug !== post.slug) {
      const existing = await prisma.post.findUnique({ where: { slug: data.slug } })
      if (existing) {
        return NextResponse.json({ error: `Slug "${data.slug}" already exists` }, { status: 400 })
      }
    }
    updates.slug = data.slug.trim()
  }

  if (data.markdown !== undefined) {
    updates.markdown = data.markdown
    // Create revision if markdown changed
    if (data.markdown !== post.markdown) {
      await prisma.revision.create({
        data: {
          postId: post.id,
          markdown: data.markdown,
        },
      })
    }
  }

  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'published' && !post.publishedAt) {
      updates.publishedAt = new Date()
    }
  }

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: updates,
  })

  return NextResponse.json({
    id: updated.id,
    slug: updated.slug,
    status: updated.status,
  })
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.post.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}


