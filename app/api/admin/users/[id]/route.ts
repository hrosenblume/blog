import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, requireAdmin, notFound, badRequest, normalizeEmail } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withAdmin(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return notFound()

  return NextResponse.json(user)
})

export const PUT = withAdmin(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const data = await request.json()
  if (!data.email?.includes('@')) return badRequest('Valid email is required')

  const email = normalizeEmail(data.email)
  const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } })
  if (existing) return badRequest('Another user with this email already exists')

  const user = await prisma.user.update({
    where: { id },
    data: { email, name: data.name ?? null, role: data.role ?? 'writer' },
  })

  return NextResponse.json(user)
})

export const DELETE = withAdmin(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await requireAdmin()
  const currentEmail = session?.user?.email ? normalizeEmail(session.user.email) : ''
  const currentUser = await prisma.user.findFirst({ where: { email: currentEmail } })
  if (currentUser?.id === id) return badRequest('Cannot delete yourself')

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
})
