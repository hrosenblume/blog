import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, notFound, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })
  
  if (!tag) return notFound()

  return NextResponse.json({
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    postCount: tag._count.posts
  })
})

export const PATCH = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const data = await request.json()
  const name = data.name?.trim()

  if (!name) return badRequest('Tag name is required')

  // Check for duplicate name (excluding current tag)
  const existing = await prisma.tag.findFirst({
    where: { name, NOT: { id } }
  })
  if (existing) return badRequest('A tag with this name already exists')

  const tag = await prisma.tag.update({
    where: { id },
    data: { name }
  })

  return NextResponse.json(tag)
})

export const DELETE = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  
  await prisma.tag.delete({ where: { id } })
  
  return NextResponse.json({ success: true })
})
