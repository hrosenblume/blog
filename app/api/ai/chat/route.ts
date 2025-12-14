import { NextRequest } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateChatStream, ChatMessage } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'
import { getStyleContext, buildChatPromptWithEssay, EssayContext } from '@/lib/ai/system-prompt'

interface ChatRequest {
  messages: ChatMessage[]
  modelId?: string
  essayContext?: EssayContext | null
}

// POST /api/ai/chat - Streaming chat for brainstorming essays
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: ChatRequest = await request.json()

  if (!body.messages?.length) {
    return badRequest('Messages are required')
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

  // Build system prompt with style context and optional essay context
  const context = await getStyleContext()
  const systemPrompt = buildChatPromptWithEssay(context, body.essayContext)

  try {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateChatStream(modelId!, systemPrompt, body.messages)) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (error) {
          console.error('Chat stream error:', error)
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
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    const message = error instanceof Error ? error.message : 'Chat failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
