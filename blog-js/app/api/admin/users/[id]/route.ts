import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can view user details
  if (!(await isAdmin(session.user?.email))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can edit users
  if (!(await isAdmin(session.user?.email))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const data = await request.json()

  // Validate email
  if (!data.email || !data.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Check if email already exists for another user
  const existing = await prisma.user.findFirst({
    where: {
      email: data.email.toLowerCase().trim(),
      NOT: { id: params.id },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Another user with this email already exists' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name || null,
      role: data.role || 'writer',
    },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can delete users
  if (!(await isAdmin(session.user?.email))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Prevent deleting yourself
  const currentUser = await prisma.user.findFirst({
    where: { email: session.user?.email?.toLowerCase().trim() || '' },
  })

  if (currentUser?.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }

  await prisma.user.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
