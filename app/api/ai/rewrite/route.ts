import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generate } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'
import { getStyleContext, buildRewritePrompt } from '@/lib/ai/system-prompt'

interface RewriteRequest {
  text: string
  modelId?: string
}

// POST /api/ai/rewrite - Rewrite selected text in author's voice
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: RewriteRequest = await request.json()

  if (!body.text?.trim()) {
    return badRequest('Text is required')
  }

  // Get model - use provided, or fall back to settings default
  let modelId = body.modelId
  if (!modelId) {
    const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
    modelId = settings?.defaultModel || 'claude-sonnet'
  }

  const model = getModel(modelId)
  if (!model) {
    return badRequest(`Unknown model: ${modelId}. Available: ${AI_MODELS.map(m => m.id).join(', ')}`)
  }

  // Build system prompt with style context
  const context = await getStyleContext()
  const systemPrompt = buildRewritePrompt(context)

  const userPrompt = `Write this in a cleaner way, matching my writing style:

"${body.text.trim()}"`

  try {
    const result = await generate(modelId, systemPrompt, userPrompt)

    // Clean up the response - remove quotes if the model added them
    let rewrittenText = result.text.trim()
    if (rewrittenText.startsWith('"') && rewrittenText.endsWith('"')) {
      rewrittenText = rewrittenText.slice(1, -1)
    }

    return NextResponse.json({
      text: rewrittenText,
      model: model.name,
      modelId: model.id,
    })
  } catch (error) {
    console.error('AI rewrite error:', error)
    const message = error instanceof Error ? error.message : 'Rewrite failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
