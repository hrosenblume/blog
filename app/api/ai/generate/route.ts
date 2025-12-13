import { NextRequest, NextResponse } from 'next/server'
import { withSession, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generate } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'
import { parseGeneratedContent } from '@/lib/ai/parse'
import { wordCount } from '@/lib/markdown'

interface GenerateRequest {
  prompt: string
  length?: 'short' | 'medium' | 'long'
  modelId?: string
}

const LENGTH_TARGETS: Record<string, number> = {
  short: 500,
  medium: 1000,
  long: 2000,
}

// POST /api/ai/generate - Generate essay content
export const POST = withSession(async (request: NextRequest) => {
  const body: GenerateRequest = await request.json()

  if (!body.prompt?.trim()) {
    return badRequest('Prompt is required')
  }

  const length = body.length || 'medium'
  const targetWords = LENGTH_TARGETS[length] || 1000

  // Get model - use provided, or fall back to settings default, or fall back to claude-sonnet
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

  // Build system prompt with rules first (they override everything)
  const systemPrompt = `You are a writing assistant that writes in the author's voice.

## Writing Rules (Follow these exactly)
${customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (Write in this voice)
${styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

Output ONLY markdown. No preamble, no "Here is...", no explanations. Just the essay content.`

  const userPrompt = `Write an essay of approximately ${targetWords} words about:

${body.prompt.trim()}`

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
})
