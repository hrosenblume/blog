import { NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth'
import { runAutoDraft } from '@/lib/auto-draft'

// POST /api/admin/topics/generate - Generate for all active topics
export const POST = withAdmin(async () => {
  try {
    // Run auto-draft for all active topics, skipping frequency check (manual trigger)
    const results = await runAutoDraft(undefined, true)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Auto-draft generation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
})

