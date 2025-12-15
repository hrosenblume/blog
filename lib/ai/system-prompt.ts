import { prisma } from '@/lib/db'

// Default templates exported for UI reset functionality
export const DEFAULT_GENERATE_TEMPLATE = `You are a writing assistant that writes in the author's voice.

## Writing Rules (Follow these exactly)
{{RULES}}

## Style Reference (Write in this voice)
{{STYLE_EXAMPLES}}

---

Output ONLY markdown. No preamble, no "Here is...", no explanations. Just the essay content.`

export const DEFAULT_CHAT_TEMPLATE = `You are a helpful writing assistant that helps brainstorm and develop essay ideas.

## Chat Behavior (How to interact)
{{CHAT_RULES}}

## Writing Style (When drafting content, follow these)
{{RULES}}

## Style Reference (The author writes like this)
{{STYLE_EXAMPLES}}

---

You are having a conversation to help develop essay ideas. Follow the chat behavior rules above. When suggesting ideas or drafting content, match the author's writing style.`

export const DEFAULT_REWRITE_TEMPLATE = `You are a writing assistant that rewrites text to match the author's voice and style.

## Writing Rules (Follow these exactly)
{{RULES}}

## Rewrite Rules (Follow these for cleanup)
{{REWRITE_RULES}}

## Style Reference (The author writes like this)
{{STYLE_EXAMPLES}}

---

Your task is to rewrite the given text to be cleaner and more in line with the author's style. Output ONLY the rewritten text. No preamble, no "Here is...", no explanations. Just the rewritten text.`

export const DEFAULT_AUTO_DRAFT_TEMPLATE = `You are a writing assistant that writes thought-provoking essays inspired by current news.

## Auto-Draft Rules (Follow these for news-inspired essays)
{{AUTO_DRAFT_RULES}}

## Topic-Specific Focus
{{ESSAY_FOCUS}}

## General Writing Rules
{{RULES}}

## Style Reference (Write in this voice)
{{STYLE_EXAMPLES}}

---

Write an essay of approximately {{AUTO_DRAFT_WORD_COUNT}} words inspired by this news article. Offer an original perspective and personal insights - don't just summarize the news.

TOPIC: {{TOPIC_NAME}}
ARTICLE TITLE: {{ARTICLE_TITLE}}
ARTICLE SUMMARY: {{ARTICLE_SUMMARY}}
SOURCE: {{ARTICLE_URL}}

Output ONLY markdown. No preamble, no "Here is...", no explanations. Start with a compelling title using markdown # heading.`

export interface StyleContext {
  customRules: string
  chatRules: string
  rewriteRules: string
  autoDraftRules: string
  styleExamples: string
  generateTemplate: string | null
  chatTemplate: string | null
  rewriteTemplate: string | null
  autoDraftTemplate: string | null
  autoDraftWordCount: number
}

/**
 * Replace template placeholders with actual values.
 */
function applyPlaceholders(
  template: string,
  customRules: string,
  chatRules: string,
  rewriteRules: string,
  styleExamples: string
): string {
  const rulesValue = customRules || 'No specific rules provided. Match the style of the examples.'
  const chatRulesValue = chatRules || 'Be direct, insightful, and push back on vague ideas. Ask clarifying questions when needed.'
  const rewriteRulesValue = rewriteRules || 'Keep the same meaning. Improve clarity and flow. Remove filler words.'
  const styleValue = styleExamples || 'No published essays available. Write in a clear, personal essay style.'

  return template
    .replace(/\{\{RULES\}\}/g, rulesValue)
    .replace(/\{\{CHAT_RULES\}\}/g, chatRulesValue)
    .replace(/\{\{REWRITE_RULES\}\}/g, rewriteRulesValue)
    .replace(/\{\{STYLE_EXAMPLES\}\}/g, styleValue)
}

/**
 * Fetch AI settings and published posts to build style context.
 * Shared by generate, chat, rewrite, and auto-draft APIs.
 */
export async function getStyleContext(): Promise<StyleContext> {
  // Fetch AI settings for custom rules and templates
  const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
  const customRules = settings?.rules || ''
  const chatRules = settings?.chatRules || ''
  const rewriteRules = settings?.rewriteRules || ''
  const autoDraftRules = settings?.autoDraftRules || ''
  const generateTemplate = settings?.generateTemplate || null
  const chatTemplate = settings?.chatTemplate || null
  const rewriteTemplate = settings?.rewriteTemplate || null
  const autoDraftTemplate = settings?.autoDraftTemplate || null
  const autoDraftWordCount = settings?.autoDraftWordCount || 800

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

  return { 
    customRules, 
    chatRules, 
    rewriteRules, 
    autoDraftRules,
    styleExamples, 
    generateTemplate, 
    chatTemplate, 
    rewriteTemplate,
    autoDraftTemplate,
    autoDraftWordCount,
  }
}

/**
 * Build a system prompt for essay generation.
 */
export function buildGeneratePrompt(context: StyleContext): string {
  const template = context.generateTemplate || DEFAULT_GENERATE_TEMPLATE
  return applyPlaceholders(template, context.customRules, context.chatRules, context.rewriteRules, context.styleExamples)
}

/**
 * Build a system prompt for chat/brainstorming.
 */
export function buildChatPrompt(context: StyleContext): string {
  const template = context.chatTemplate || DEFAULT_CHAT_TEMPLATE
  return applyPlaceholders(template, context.customRules, context.chatRules, context.rewriteRules, context.styleExamples)
}

export interface EssayContext {
  title: string
  subtitle?: string
  markdown: string
}

/**
 * Build a system prompt for chat/brainstorming with the current essay in context.
 * When an essay is being edited, this provides the AI with awareness of its content.
 */
export function buildChatPromptWithEssay(
  context: StyleContext,
  essay?: EssayContext | null
): string {
  const basePrompt = buildChatPrompt(context)
  
  if (!essay?.markdown) return basePrompt
  
  const header = essay.subtitle 
    ? `# ${essay.title}\n*${essay.subtitle}*` 
    : `# ${essay.title}`
    
  return `${basePrompt}

---

## Current Essay Draft

When the user refers to "this essay", "this paragraph", "the intro", "the conclusion", or any specific section, they mean the content below. Help them improve, critique, or discuss this draft.

${header}

${essay.markdown}`
}

/**
 * Build a system prompt for rewriting selected text.
 * Uses rewrite-specific rules and template for cleanup operations.
 */
export function buildRewritePrompt(context: StyleContext): string {
  const template = context.rewriteTemplate || DEFAULT_REWRITE_TEMPLATE
  return applyPlaceholders(template, context.customRules, context.chatRules, context.rewriteRules, context.styleExamples)
}

/**
 * Build a system prompt for generating essays from news articles.
 * Used by auto-draft feature to create suggested posts from RSS feeds.
 */
export function buildNewsEssayPrompt(
  article: { title: string; summary: string; url: string },
  topicName: string,
  context: StyleContext,
  essayFocus?: string | null
): string {
  const template = context.autoDraftTemplate || DEFAULT_AUTO_DRAFT_TEMPLATE
  
  // Get values for placeholders
  const rulesValue = context.customRules || 'No specific rules provided. Match the style of the examples.'
  const autoDraftRulesValue = context.autoDraftRules || 'Write original perspectives on news. Be thought-provoking. Avoid summarizing.'
  const styleValue = context.styleExamples || 'No published essays available. Write in a clear, personal essay style.'
  const essayFocusValue = essayFocus || 'No specific focus provided. Write with a general perspective on this topic.'
  
  return template
    .replace(/\{\{AUTO_DRAFT_RULES\}\}/g, autoDraftRulesValue)
    .replace(/\{\{AUTO_DRAFT_WORD_COUNT\}\}/g, String(context.autoDraftWordCount))
    .replace(/\{\{ESSAY_FOCUS\}\}/g, essayFocusValue)
    .replace(/\{\{RULES\}\}/g, rulesValue)
    .replace(/\{\{STYLE_EXAMPLES\}\}/g, styleValue)
    .replace(/\{\{TOPIC_NAME\}\}/g, topicName)
    .replace(/\{\{ARTICLE_TITLE\}\}/g, article.title)
    .replace(/\{\{ARTICLE_SUMMARY\}\}/g, article.summary || 'No summary available')
    .replace(/\{\{ARTICLE_URL\}\}/g, article.url)
}
