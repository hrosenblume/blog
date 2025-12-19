import { NextRequest } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateChatStream, generate, ChatMessage } from '@/lib/ai/provider'
import { resolveModel, getSearchModel } from '@/lib/ai/models'
import { getStyleContext, buildChatPromptWithEssay, buildAgentChatPrompt, buildSearchOnlyPrompt } from '@/lib/ai/system-prompt'
import type { ChatMode, EssayContext } from '@/lib/chat'

interface ChatRequest {
  messages: ChatMessage[]
  modelId?: string
  essayContext?: EssayContext | null
  mode?: ChatMode
  useSearchModel?: boolean // When true, use the search variant of the model
}

// POST /api/ai/chat - Streaming chat for brainstorming essays
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: ChatRequest = await request.json()

  if (!body.messages?.length) {
    return badRequest('Messages are required')
  }

  // Resolve model (provided or default from DB)
  let model
  try {
    model = await resolveModel(body.modelId, async () => {
      const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
      return settings?.defaultModel || null
    })
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : 'Invalid model')
  }
  
  // Determine the actual model to use (may switch to search variant)
  const searchModelVariant = getSearchModel(model.id)
  const actualModelId = body.useSearchModel && searchModelVariant ? searchModelVariant : model.id

  // Handle search mode - non-streaming, returns JSON with facts only
  if (body.mode === 'search') {
    try {
      const searchPrompt = buildSearchOnlyPrompt()
      const lastMessage = body.messages[body.messages.length - 1]
      // For search mode, always use the search variant if available
      const searchModel = searchModelVariant || model.id
      const result = await generate(searchModel, searchPrompt, lastMessage.content, 2048)
      
      return new Response(JSON.stringify({ content: result.text }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Search error:', error)
      const message = error instanceof Error ? error.message : 'Search failed'
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Build system prompt with style context and optional essay context
  // Use agent prompt when in agent mode, otherwise use regular chat prompt
  const context = await getStyleContext()
  const systemPrompt = body.mode === 'agent'
    ? buildAgentChatPrompt(context, body.essayContext)
    : buildChatPromptWithEssay(context, body.essayContext)

  try {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateChatStream(actualModelId, systemPrompt, body.messages)) {
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
