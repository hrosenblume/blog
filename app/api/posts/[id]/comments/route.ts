import { NextRequest, NextResponse } from 'next/server'
import { withSession, auth, badRequest, normalizeEmail } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

// GET - List all comments for post (top-level with nested replies, excludes deleted)
export const GET = withSession(async (_req: NextRequest, { params }: RouteContext) => {
  const { id } = await params

  const comments = await prisma.comment.findMany({
    where: { postId: id, parentId: null, deletedAt: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      replies: {
        where: { deletedAt: null },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
})

// POST - Create comment or reply
export const POST = withSession(async (req: NextRequest, { params }: RouteContext) => {
  const { id: postId } = await params
  const session = await auth()
  const { quotedText, content, parentId } = await req.json()

  if (!content?.trim()) {
    return badRequest('Comment content is required')
  }

  // Top-level comments require quotedText
  if (!parentId && !quotedText?.trim()) {
    return badRequest('Selected text is required for new comments')
  }

  // Validate parent exists and is top-level (no nested replies)
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent) return badRequest('Parent comment not found')
    if (parent.parentId) return badRequest('Cannot reply to a reply')
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(session!.user!.email!) },
  })

  if (!user) {
    return badRequest('User not found')
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: user.id,
      quotedText: quotedText || '',
      content: content.trim(),
      parentId: parentId || null,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(comment)
})

