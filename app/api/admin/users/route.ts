import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, badRequest, normalizeEmail } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = withAdmin(async () => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
})

export const POST = withAdmin(async (request: NextRequest) => {
  const data = await request.json()
  if (!data.email?.includes('@')) return badRequest('Valid email is required')

  const email = normalizeEmail(data.email)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return badRequest('User with this email already exists')

  const user = await prisma.user.create({
    data: { email, name: data.name ?? null, role: data.role ?? 'writer' },
  })

  return NextResponse.json(user)
})
