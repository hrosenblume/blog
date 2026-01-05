import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const HISTORY_LIMIT = 50

// GET /api/chat/history - Get recent chat messages
export const GET = withSession(async () => {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
  })

  // Return in chronological order (oldest first)
  return NextResponse.json(messages.reverse())
})

// POST /api/chat/history - Save a chat message
export const POST = withSession(async (request: NextRequest) => {
  const body = await request.json()

  if (!body.role || !body.content) {
    return NextResponse.json(
      { error: 'role and content are required' },
      { status: 400 }
    )
  }

  if (body.role !== 'user' && body.role !== 'assistant') {
    return NextResponse.json(
      { error: 'role must be "user" or "assistant"' },
      { status: 400 }
    )
  }

  const message = await prisma.chatMessage.create({
    data: {
      role: body.role,
      content: body.content,
    },
  })

  return NextResponse.json(message)
})

