import { prisma } from '@/lib/db'

interface StyleContext {
  customRules: string
  chatRules: string
  styleExamples: string
}

/**
 * Fetch AI settings and published posts to build style context.
 * Shared by generate, chat, and rewrite APIs.
 */
export async function getStyleContext(): Promise<StyleContext> {
  // Fetch AI settings for custom rules
  const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
  const customRules = settings?.rules || ''
  const chatRules = settings?.chatRules || ''

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

  return { customRules, chatRules, styleExamples }
}

/**
 * Build a system prompt for essay generation.
 */
export function buildGeneratePrompt(context: StyleContext): string {
  return `You are a writing assistant that writes in the author's voice.

## Writing Rules (Follow these exactly)
${context.customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (Write in this voice)
${context.styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

Output ONLY markdown. No preamble, no "Here is...", no explanations. Just the essay content.`
}

/**
 * Build a system prompt for chat/brainstorming.
 */
export function buildChatPrompt(context: StyleContext): string {
  // Use chat-specific rules if provided, otherwise fall back to writing rules
  const behaviorRules = context.chatRules || 'Be direct, insightful, and push back on vague ideas. Ask clarifying questions when needed.'
  
  return `You are a helpful writing assistant that helps brainstorm and develop essay ideas.

## Chat Behavior (How to interact)
${behaviorRules}

## Writing Style (When drafting content, follow these)
${context.customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (The author writes like this)
${context.styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

You are having a conversation to help develop essay ideas. Follow the chat behavior rules above. When suggesting ideas or drafting content, match the author's writing style.`
}

/**
 * Build a system prompt for rewriting selected text.
 */
export function buildRewritePrompt(context: StyleContext): string {
  return `You are a writing assistant that rewrites text to match the author's voice and style.

## Writing Rules (Follow these exactly)
${context.customRules || 'No specific rules provided. Match the style of the examples.'}

## Style Reference (The author writes like this)
${context.styleExamples || 'No published essays available. Write in a clear, personal essay style.'}

---

Your task is to rewrite the given text to be cleaner and more in line with the author's style. Output ONLY the rewritten text. No preamble, no "Here is...", no explanations. Just the rewritten text.`
}
