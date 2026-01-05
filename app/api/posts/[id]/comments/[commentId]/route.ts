import { NextRequest, NextResponse } from 'next/server'
import { withSession, auth, badRequest, notFound, forbidden, isAdmin, normalizeEmail } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string; commentId: string }> }

// PATCH - Update comment content (own only)
export const PATCH = withSession(async (req: NextRequest, { params }: RouteContext) => {
  const { id: postId, commentId } = await params
  const session = await auth()
  const { content } = await req.json()

  if (!content?.trim()) {
    return badRequest('Comment content is required')
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment || comment.postId !== postId) {
    return notFound()
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: normalizeEmail(session!.user!.email!) },
  })

  if (!currentUser || comment.userId !== currentUser.id) {
    return forbidden()
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: content.trim() },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(updated)
})

// DELETE - Delete comment (own or admin)
export const DELETE = withSession(async (_req: NextRequest, { params }: RouteContext) => {
  const { id: postId, commentId } = await params
  const session = await auth()

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment || comment.postId !== postId) {
    return notFound()
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: normalizeEmail(session!.user!.email!) },
  })

  const userIsAdmin = await isAdmin(session!.user!.email)

  if (!currentUser || (comment.userId !== currentUser.id && !userIsAdmin)) {
    return forbidden()
  }

  // Soft delete - set deletedAt timestamp
  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
})

