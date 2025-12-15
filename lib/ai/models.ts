/** Full model definition with provider details */
export const AI_MODELS = [
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    description: 'Fast, capable, best value',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    description: 'Highest quality, slower',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    description: 'OpenAI flagship',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    description: 'Fast and cheap',
  },
] as const

export type ModelId = (typeof AI_MODELS)[number]['id']
export type AIModel = (typeof AI_MODELS)[number]

/** Subset of AIModel for UI dropdowns (returned by /api/ai/settings) */
export interface AIModelOption {
  id: string
  name: string
  description: string
}

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id)
}

/**
 * Resolve a model ID, falling back to database default or hardcoded default.
 * Used by AI API routes to avoid duplicating model resolution logic.
 * 
 * @param providedModelId - Optional model ID from request
 * @param getDefaultModelId - Async function to get default from DB (avoids Prisma import here)
 * @returns Resolved AIModel
 * @throws Error if model not found
 */
export async function resolveModel(
  providedModelId: string | undefined,
  getDefaultModelId: () => Promise<string | null>
): Promise<AIModel> {
  let modelId = providedModelId
  
  if (!modelId) {
    modelId = (await getDefaultModelId()) || 'claude-sonnet'
  }
  
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}. Available: ${AI_MODELS.map(m => m.id).join(', ')}`)
  }
  
  return model
}
