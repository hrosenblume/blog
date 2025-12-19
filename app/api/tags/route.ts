import { NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/tags - List all tags (for editor dropdown)
export const GET = withSession(async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true
    }
  })

  return NextResponse.json(tags)
})


