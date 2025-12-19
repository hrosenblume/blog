import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generate, generateStream } from '@/lib/ai/provider'
import { resolveModel } from '@/lib/ai/models'
import { parseGeneratedContent } from '@/lib/ai/parse'
import { getStyleContext, buildGeneratePrompt, buildSearchOnlyPrompt } from '@/lib/ai/system-prompt'
import { wordCount } from '@/lib/markdown'

interface GenerateRequest {
  prompt: string
  wordCount?: number
  modelId?: string
  stream?: boolean
  useWebSearch?: boolean
}

// POST /api/ai/generate - Generate essay content (supports streaming)
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const body: GenerateRequest = await request.json()

  if (!body.prompt?.trim()) {
    return badRequest('Prompt is required')
  }

  const targetWords = body.wordCount || 500
  const shouldStream = body.stream === true
  const useWebSearch = body.useWebSearch === true

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

  // If web search is enabled, first gather facts about the topic
  let searchContext = ''
  if (useWebSearch) {
    try {
      const searchPrompt = buildSearchOnlyPrompt()
      const searchQuery = `Find current facts, data, and information about: ${body.prompt.trim()}`
      const searchResult = await generate(model.id, searchPrompt, searchQuery, 1024)
      searchContext = searchResult.text
    } catch (error) {
      console.error('Web search error:', error)
      // Continue without search context if it fails
    }
  }

  const context = await getStyleContext()
  const systemPrompt = buildGeneratePrompt(context)

  // Build user prompt with optional search context
  let userPrompt = `Write an essay of approximately ${targetWords} words about:

${body.prompt.trim()}`

  if (searchContext) {
    userPrompt += `

---
RESEARCH CONTEXT (use this information to inform your essay):
${searchContext}
---`
  }

  // Streaming response
  if (shouldStream) {
    try {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateStream(model.id, systemPrompt, userPrompt)) {
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
    const result = await generate(model.id, systemPrompt, userPrompt)

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
