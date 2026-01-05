import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string; commentId: string }> }

// POST - Toggle resolved status
export const POST = withSession(async (_req: NextRequest, { params }: RouteContext) => {
  const { id: postId, commentId } = await params

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment || comment.postId !== postId) {
    return notFound()
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { resolved: !comment.resolved },
    include: {
      user: { select: { id: true, name: true, email: true } },
      replies: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return NextResponse.json(updated)
})

