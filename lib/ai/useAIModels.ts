'use client'

import { useState, useEffect } from 'react'
import type { AIModelOption } from './models'

interface UseAIModelsOptions {
  /** External selected model state (for context-managed selection) */
  externalSelectedModel?: string
  /** External setter (for context-managed selection) */
  externalSetSelectedModel?: (id: string) => void
}

interface UseAIModelsResult {
  models: AIModelOption[]
  selectedModel: string
  setSelectedModel: (id: string) => void
  currentModel: AIModelOption | undefined
  isLoading: boolean
}

/**
 * Hook to fetch available AI models and manage selection.
 * Fetches models from /api/ai/settings and sets default model on mount.
 * 
 * Can use internal state (default) or external state (for context-managed selection).
 */
export function useAIModels(options?: UseAIModelsOptions): UseAIModelsResult {
  const [models, setModels] = useState<AIModelOption[]>([])
  const [internalSelectedModel, setInternalSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Use external state if provided, otherwise internal
  const selectedModel = options?.externalSelectedModel ?? internalSelectedModel
  const setSelectedModel = options?.externalSetSelectedModel ?? setInternalSelectedModel

  useEffect(() => {
    fetch('/api/ai/settings')
      .then(res => res.json())
      .then(data => {
        setModels(data.availableModels || [])
        if (data.defaultModel && !selectedModel) {
          setSelectedModel(data.defaultModel)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally omit selectedModel/setSelectedModel - we only want to set default on mount

  const currentModel = models.find(m => m.id === selectedModel)

  return {
    models,
    selectedModel,
    setSelectedModel,
    currentModel,
    isLoading,
  }
}


