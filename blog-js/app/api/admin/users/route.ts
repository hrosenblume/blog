import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can list users
  if (!(await isAdmin(session.user?.email))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can create users
  if (!(await isAdmin(session.user?.email))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const data = await request.json()

  // Validate email
  if (!data.email || !data.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  })

  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
  }

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name || null,
      role: data.role || 'writer',
    },
  })

  return NextResponse.json(user)
}
