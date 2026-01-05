import { NextRequest } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateChatStream, generate, ChatMessage } from '@/lib/ai/provider'
import { resolveModel, getSearchModel, modelHasNativeSearch } from '@/lib/ai/models'
import { getStyleContext, buildChatPromptWithEssay, buildAgentChatPrompt, buildSearchOnlyPrompt } from '@/lib/ai/system-prompt'
import type { ChatMode, EssayContext } from '@/lib/chat'

interface ChatRequest {
  messages: ChatMessage[]
  modelId?: string
  essayContext?: EssayContext | null
  mode?: ChatMode
  useWebSearch?: boolean // When true, enable web search (native for GPT, 2-call for Claude)
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
  
  // Determine web search capabilities
  const hasNativeSearch = modelHasNativeSearch(model.id)
  const useWebSearch = body.useWebSearch && hasNativeSearch

  // Handle search mode - non-streaming, returns JSON with facts only
  // Used by 2-call flow when Claude needs web search (calls GPT first)
  if (body.mode === 'search') {
    try {
      const searchPrompt = buildSearchOnlyPrompt()
      const lastMessage = body.messages[body.messages.length - 1]
      // For search mode with GPT, use native web search tools
      const result = await generate(model.id, searchPrompt, lastMessage.content, 2048, hasNativeSearch)
      
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

  // Build system prompt with style context, essay context, and web search flag
  const context = await getStyleContext()
  const systemPrompt = body.mode === 'agent'
    ? buildAgentChatPrompt(context, body.essayContext, useWebSearch)
    : buildChatPromptWithEssay(context, body.essayContext, useWebSearch)

  try {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Pass web search flag to streaming function
          for await (const chunk of generateChatStream(model.id, systemPrompt, body.messages, 4096, useWebSearch)) {
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
