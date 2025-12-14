import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generate } from '@/lib/ai/provider'
import { getModel, AI_MODELS } from '@/lib/ai/models'

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

  // Build system prompt for rewriting
  const systemPrompt = `You are a writing assistant that rewrites text to match the author's voice and style.

## Writing Rules (Follow these exactly)
${customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (The author writes like this)
${styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

Your task is to rewrite the given text to be cleaner and more in line with the author's style. Output ONLY the rewritten text. No preamble, no "Here is...", no explanations. Just the rewritten text.`

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
