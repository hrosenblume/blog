import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getModel } from './models'
import { prisma } from '@/lib/db'

interface GenerateResult {
  text: string
  inputTokens?: number
  outputTokens?: number
}

/** Message format for chat conversations */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Get API key for a provider, checking DB first then falling back to env var.
 */
async function getApiKey(provider: 'anthropic' | 'openai'): Promise<string | null> {
  // Try IntegrationSettings DB first
  const settings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' },
  })
  
  if (provider === 'anthropic') {
    return settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || null
  }
  return settings?.openaiApiKey || process.env.OPENAI_API_KEY || null
}

/**
 * Generate text using the specified model.
 * Abstracts away the differences between Anthropic and OpenAI APIs.
 * 
 * @param modelId - Can be either a model ID from AI_MODELS (e.g., 'gpt-5.2') 
 *                  or a raw model name (e.g., 'gpt-5.2-search-preview')
 */
export async function generate(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<GenerateResult> {
  // First try to resolve from AI_MODELS
  const model = getModel(modelId)
  
  if (model) {
    // Known model from AI_MODELS
    if (model.provider === 'anthropic') {
      return generateWithAnthropic(model.model, systemPrompt, userPrompt, maxTokens)
    }
    return generateWithOpenAI(model.model, systemPrompt, userPrompt, maxTokens)
  }
  
  // Raw model name - determine provider from name
  if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
    return generateWithAnthropic(modelId, systemPrompt, userPrompt, maxTokens)
  }
  // Assume OpenAI for gpt-*, o1-*, etc.
  return generateWithOpenAI(modelId, systemPrompt, userPrompt, maxTokens)
}

async function generateWithAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GenerateResult> {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Add it at /admin/integrations')
  }

  const client = new Anthropic({
    apiKey,
  })

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ],
  })

  const textContent = response.content.find(c => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  return {
    text: textContent.text,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
  }
}

async function generateWithOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GenerateResult> {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it at /admin/integrations')
  }

  const client = new OpenAI({
    apiKey,
  })

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in response')
  }

  return {
    text: content,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  }
}

/**
 * Stream text generation using the specified model.
 * Yields text chunks as they arrive from the API.
 */
export async function* generateStream(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): AsyncGenerator<string, void, unknown> {
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  if (model.provider === 'anthropic') {
    yield* streamWithAnthropic(model.model, systemPrompt, userPrompt, maxTokens)
  } else {
    yield* streamWithOpenAI(model.model, systemPrompt, userPrompt, maxTokens)
  }
}

/**
 * Stream chat messages using the specified model.
 * Yields text chunks as they arrive from the API.
 * 
 * @param modelId - Can be either a model ID from AI_MODELS (e.g., 'gpt-5.2') 
 *                  or a raw model name (e.g., 'gpt-5.2-search-preview')
 */
export async function* generateChatStream(
  modelId: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 4096
): AsyncGenerator<string, void, unknown> {
  // First try to resolve from AI_MODELS
  const model = getModel(modelId)
  
  if (model) {
    // Known model from AI_MODELS
    if (model.provider === 'anthropic') {
      yield* chatStreamWithAnthropic(model.model, systemPrompt, messages, maxTokens)
    } else {
      yield* chatStreamWithOpenAI(model.model, systemPrompt, messages, maxTokens)
    }
  } else {
    // Raw model name - determine provider from name
    if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
      yield* chatStreamWithAnthropic(modelId, systemPrompt, messages, maxTokens)
    } else {
      // Assume OpenAI for gpt-*, o1-*, etc.
      yield* chatStreamWithOpenAI(modelId, systemPrompt, messages, maxTokens)
    }
  }
}

async function* streamWithAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Add it at /admin/integrations')
  }

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

async function* streamWithOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it at /admin/integrations')
  }

  const client = new OpenAI({ apiKey })

  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      yield delta
    }
  }
}

async function* chatStreamWithAnthropic(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Add it at /admin/integrations')
  }

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

async function* chatStreamWithOpenAI(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it at /admin/integrations')
  }

  const client = new OpenAI({ apiKey })

  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      yield delta
    }
  }
}
