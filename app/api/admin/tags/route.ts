import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withAdmin(async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  // Transform to include postCount at top level
  const tagsWithCount = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    postCount: tag._count.posts
  }))

  return NextResponse.json(tagsWithCount)
})

export const POST = withAdmin(async (request: NextRequest) => {
  const data = await request.json()
  const name = data.name?.trim()
  
  if (!name) return badRequest('Tag name is required')

  const existing = await prisma.tag.findUnique({ where: { name } })
  if (existing) return badRequest('A tag with this name already exists')

  const tag = await prisma.tag.create({
    data: { name }
  })

  return NextResponse.json(tag)
})

