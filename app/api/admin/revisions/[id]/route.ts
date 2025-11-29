import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/revisions/[id] - Get single revision with post info
export const GET = withAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const revision = await prisma.revision.findUnique({
    where: { id: params.id },
    include: {
      post: {
        select: { id: true, title: true, subtitle: true, slug: true, markdown: true, polyhedraShape: true }
      }
    }
  })

  if (!revision) return notFound()

  return NextResponse.json({
    id: revision.id,
    title: revision.title,
    subtitle: revision.subtitle,
    markdown: revision.markdown,
    polyhedraShape: revision.polyhedraShape,
    createdAt: revision.createdAt.toISOString(),
    post: revision.post
  })
})

