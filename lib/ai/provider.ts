import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getModel } from './models'

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
 * Generate text using the specified model.
 * Abstracts away the differences between Anthropic and OpenAI APIs.
 */
export async function generate(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<GenerateResult> {
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  if (model.provider === 'anthropic') {
    return generateWithAnthropic(model.model, systemPrompt, userPrompt, maxTokens)
  }
  // model.provider === 'openai'
  return generateWithOpenAI(model.model, systemPrompt, userPrompt, maxTokens)
}

async function generateWithAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GenerateResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Add it to .env.local and restart the server.')
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it to .env.local and restart the server.')
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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
 */
export async function* generateChatStream(
  modelId: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 4096
): AsyncGenerator<string, void, unknown> {
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  if (model.provider === 'anthropic') {
    yield* chatStreamWithAnthropic(model.model, systemPrompt, messages, maxTokens)
  } else {
    yield* chatStreamWithOpenAI(model.model, systemPrompt, messages, maxTokens)
  }
}

async function* streamWithAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
