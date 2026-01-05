'use client'

import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ControlButton } from '@/components/ui/control-button'
import type { AIModelOption } from '@/lib/ai/models'

interface ModelSelectorProps {
  models: AIModelOption[]
  selectedModel: string
  onModelChange: (id: string) => void
  /** Optional: current model object (avoids re-lookup) */
  currentModel?: AIModelOption
  /** z-index for dropdown content (default: none) */
  zIndex?: number
}

/**
 * Dropdown selector for AI models.
 * Used in ChatPanel and writer dashboard.
 */
export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  currentModel,
  zIndex,
}: ModelSelectorProps) {
  const displayModel = currentModel ?? models.find(m => m.id === selectedModel)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ControlButton>
          {displayModel?.name || 'Select model'}
          <ChevronDown className="w-3.5 h-3.5" />
        </ControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="min-w-[180px]"
        style={zIndex ? { zIndex } : undefined}
      >
        {models.map(model => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-center justify-between"
          >
            <span>{model.name}</span>
            {selectedModel === model.id && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
