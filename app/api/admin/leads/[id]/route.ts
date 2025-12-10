import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { visitedAt: 'desc' },
      },
    },
  })

  if (!lead) return notFound()

  return NextResponse.json(lead)
})

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) return notFound()

  // Cascade delete will also remove all visits
  await prisma.lead.delete({ where: { id } })

  return NextResponse.json({ success: true })
})
