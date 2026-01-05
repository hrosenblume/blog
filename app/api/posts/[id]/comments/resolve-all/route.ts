import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

// POST - Resolve all open comments for a post
export const POST = withSession(async (_req: NextRequest, { params }: RouteContext) => {
  const { id: postId } = await params

  // Update all unresolved comments for this post
  const result = await prisma.comment.updateMany({
    where: { postId, resolved: false, parentId: null }, // Only top-level comments
    data: { resolved: true },
  })

  return NextResponse.json({ resolved: result.count })
})

