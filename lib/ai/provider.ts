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
 * @param useWebSearch - Enable web search tools (OpenAI only)
 */
export async function generate(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  useWebSearch: boolean = false
): Promise<GenerateResult> {
  // First try to resolve from AI_MODELS
  const model = getModel(modelId)
  
  if (model) {
    // Known model from AI_MODELS
    if (model.provider === 'anthropic') {
      return generateWithAnthropic(model.model, systemPrompt, userPrompt, maxTokens)
    }
    return generateWithOpenAI(model.model, systemPrompt, userPrompt, maxTokens, useWebSearch)
  }
  
  // Raw model name - determine provider from name
  if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
    return generateWithAnthropic(modelId, systemPrompt, userPrompt, maxTokens)
  }
  // Assume OpenAI for gpt-*, o1-*, etc.
  return generateWithOpenAI(modelId, systemPrompt, userPrompt, maxTokens, useWebSearch)
}

async function generateWithAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GenerateResult> {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Add it at /settings/integrations')
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
  maxTokens: number,
  useWebSearch: boolean = false
): Promise<GenerateResult> {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it at /settings/integrations')
  }

  // Use Responses API for web search, Chat Completions for normal requests
  if (useWebSearch) {
    return generateWithOpenAIResponses(apiKey, model, systemPrompt, userPrompt, maxTokens)
  }

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model,
    max_completion_tokens: maxTokens,
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
 * Generate using OpenAI Responses API (supports web search tool)
 */
async function generateWithOpenAIResponses(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GenerateResult> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: maxTokens,
      tools: [{ type: 'web_search' }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  
  // Extract text from response output
  const textOutput = data.output?.find((item: { type: string }) => item.type === 'message')
  const content = textOutput?.content?.find((c: { type: string }) => c.type === 'output_text')?.text
  
  if (!content) {
    throw new Error('No content in response')
  }

  return {
    text: content,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
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
 * @param useWebSearch - Enable web search tools (OpenAI only)
 * @param useThinking - Enable extended thinking (Claude) or enhanced reasoning prompt (OpenAI)
 */
export async function* generateChatStream(
  modelId: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 4096,
  useWebSearch: boolean = false,
  useThinking: boolean = false
): AsyncGenerator<string, void, unknown> {
  // First try to resolve from AI_MODELS
  const model = getModel(modelId)
  
  if (model) {
    // Known model from AI_MODELS
    if (model.provider === 'anthropic') {
      yield* chatStreamWithAnthropic(model.model, systemPrompt, messages, maxTokens, useThinking)
    } else {
      yield* chatStreamWithOpenAI(model.model, systemPrompt, messages, maxTokens, useWebSearch, useThinking)
    }
  } else {
    // Raw model name - determine provider from name
    if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
      yield* chatStreamWithAnthropic(modelId, systemPrompt, messages, maxTokens, useThinking)
    } else {
      // Assume OpenAI for gpt-*, o1-*, etc.
      yield* chatStreamWithOpenAI(modelId, systemPrompt, messages, maxTokens, useWebSearch, useThinking)
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
    throw new Error('Anthropic API key is not configured. Add it at /settings/integrations')
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
    throw new Error('OpenAI API key is not configured. Add it at /settings/integrations')
  }

  const client = new OpenAI({ apiKey })

  const stream = await client.chat.completions.create({
    model,
    max_completion_tokens: maxTokens,
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
  maxTokens: number,
  useThinking: boolean = false
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Add it at /settings/integrations')
  }

  const client = new Anthropic({ apiKey })

  // Extended thinking requires max_tokens > budget_tokens
  const thinkingBudget = 10000
  const effectiveMaxTokens = useThinking ? thinkingBudget + maxTokens : maxTokens

  // Build request options
  const requestOptions: Anthropic.MessageStreamParams = {
    model,
    max_tokens: effectiveMaxTokens,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  }

  // Add extended thinking when enabled
  if (useThinking) {
    requestOptions.thinking = {
      type: 'enabled',
      budget_tokens: thinkingBudget,
    }
  }

  const stream = client.messages.stream(requestOptions)

  for await (const event of stream) {
    // Only yield text deltas, not thinking deltas
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
    // Thinking blocks have delta.type === 'thinking_delta' - we skip those
  }
}

async function* chatStreamWithOpenAI(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number,
  useWebSearch: boolean = false,
  useThinking: boolean = false
): AsyncGenerator<string, void, unknown> {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it at /settings/integrations')
  }

  // Enhance system prompt with chain-of-thought when thinking is enabled
  const enhancedPrompt = useThinking
    ? `Think step-by-step before answering. Reason through the problem carefully, considering multiple angles and potential issues before providing your response.\n\n${systemPrompt}`
    : systemPrompt

  // Use Responses API for web search, Chat Completions for normal requests
  if (useWebSearch) {
    yield* chatStreamWithOpenAIResponses(apiKey, model, enhancedPrompt, messages, maxTokens)
    return
  }

  const client = new OpenAI({ apiKey })

  const stream = await client.chat.completions.create({
    model,
    max_completion_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: enhancedPrompt },
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

/**
 * Stream chat using OpenAI Responses API (supports web search tool)
 */
async function* chatStreamWithOpenAIResponses(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  // Convert messages to Responses API input format
  // The last user message is the main input, previous messages are context
  const lastUserMessage = messages[messages.length - 1]
  const previousMessages = messages.slice(0, -1)
  
  // Build input with conversation history
  let input = ''
  if (previousMessages.length > 0) {
    input = previousMessages.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n\n') + '\n\nUser: ' + lastUserMessage.content
  } else {
    input = lastUserMessage.content
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input,
      max_output_tokens: maxTokens,
      tools: [{ type: 'web_search' }],
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    
    // Process SSE events
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        
        try {
          const event = JSON.parse(data)
          // Handle different event types from Responses API streaming
          if (event.type === 'response.output_text.delta') {
            yield event.delta || ''
          } else if (event.type === 'content_part.delta' && event.delta?.text) {
            yield event.delta.text
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}
