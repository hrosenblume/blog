import { NextRequest } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateChatStream, ChatMessage } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'

interface ChatRequest {
  messages: ChatMessage[]
  modelId?: string
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

  // Fetch AI settings for custom rules
  const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
  const customRules = settings?.rules || ''

  // Fetch all published posts for style context
  const publishedPosts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { title: true, subtitle: true, markdown: true },
    orderBy: { publishedAt: 'desc' },
  })

  // Build style context from published posts
  const styleExamples = publishedPosts
    .map(p => {
      const header = p.subtitle ? `# ${p.title}\n*${p.subtitle}*\n\n` : `# ${p.title}\n\n`
      return header + p.markdown
    })
    .join('\n\n---\n\n')

  // Build system prompt for chat - focused on brainstorming and discussion
  const systemPrompt = `You are a helpful writing assistant that helps brainstorm and develop essay ideas. You write in the author's voice and style.

## Writing Rules (Follow these exactly)
${customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (The author writes like this)
${styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

You are having a conversation to help develop essay ideas. Be helpful, insightful, and match the author's voice. When suggesting ideas or drafting content, follow the writing rules and style above.`

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
