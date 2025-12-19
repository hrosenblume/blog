import { NextRequest, NextResponse } from 'next/server'
import { withSession, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withSession(async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true }
  })

  if (!post) return notFound()

  const revisions = await prisma.revision.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, title: true, createdAt: true }
  })

  return NextResponse.json(revisions.map(r => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt.toISOString()
  })))
})








