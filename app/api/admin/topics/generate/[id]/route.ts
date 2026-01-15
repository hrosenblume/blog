import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cms } from '@/lib/cms'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/admin/topics/generate/[id] - Generate for a specific topic
export const POST = withAdmin(async (_request: NextRequest, context: RouteContext) => {
  const { id } = await context.params

  // Verify topic exists
  const topic = await prisma.topicSubscription.findUnique({ where: { id } })
  if (!topic) return notFound()

  try {
    // Run auto-draft for this specific topic, skipping frequency check (manual trigger)
    const results = await cms.autoDraft.run(id, true)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error(`Auto-draft generation failed for topic ${id}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
})

