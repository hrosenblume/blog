import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generate, generateStream } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'
import { parseGeneratedContent } from '@/lib/ai/parse'
import { getStyleContext, buildGeneratePrompt } from '@/lib/ai/system-prompt'
import { wordCount } from '@/lib/markdown'

interface GenerateRequest {
  prompt: string
  length?: 'short' | 'medium' | 'long'
  modelId?: string
  stream?: boolean
}

const LENGTH_TARGETS: Record<string, number> = {
  short: 500,
  medium: 1000,
  long: 2000,
}

// POST /api/ai/generate - Generate essay content (supports streaming)
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: GenerateRequest = await request.json()

  if (!body.prompt?.trim()) {
    return badRequest('Prompt is required')
  }

  const length = body.length || 'medium'
  const targetWords = LENGTH_TARGETS[length] || 1000
  const shouldStream = body.stream === true

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

  const context = await getStyleContext()
  const systemPrompt = buildGeneratePrompt(context)

  const userPrompt = `Write an essay of approximately ${targetWords} words about:

${body.prompt.trim()}`

  // Streaming response
  if (shouldStream) {
    try {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateStream(modelId!, systemPrompt, userPrompt)) {
              controller.enqueue(encoder.encode(chunk))
            }
            controller.close()
          } catch (error) {
            console.error('Generate stream error:', error)
            const message = error instanceof Error ? error.message : 'Stream failed'
            controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Transfer-Encoding': 'chunked',
          'X-Model-Name': model.name,
          'X-Model-Id': model.id,
        },
      })
    } catch (error) {
      console.error('AI generation error:', error)
      const message = error instanceof Error ? error.message : 'Generation failed'
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Non-streaming response (original behavior)
  try {
    const result = await generate(modelId, systemPrompt, userPrompt)

    // Parse out title/subtitle from the generated markdown
    const parsed = parseGeneratedContent(result.text)

    return NextResponse.json({
      title: parsed.title,
      subtitle: parsed.subtitle,
      markdown: parsed.body,
      model: model.name,
      modelId: model.id,
      wordCount: wordCount(parsed.body),
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
    })
  } catch (error) {
    console.error('AI generation error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
