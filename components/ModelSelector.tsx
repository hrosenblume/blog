'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ControlButton } from '@/components/ui/control-button'
import type { AIModelOption } from 'autoblogger/ui'

interface ModelSelectorProps {
  models: AIModelOption[]
  selectedModel: string
  onModelChange: (id: string) => void
  currentModel: AIModelOption | undefined
  zIndex?: number
}

/**
 * Dropdown selector for AI models.
 * Used in ChatPanel and potentially other AI-powered features.
 */
export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  currentModel,
  zIndex = 50,
}: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ControlButton>
          <span className="text-xs truncate max-w-[80px]">
            {currentModel?.name || 'Model'}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </ControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ zIndex }}>
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={selectedModel === model.id ? 'bg-accent' : ''}
          >
            <span className="font-medium">{model.name}</span>
            <span className="ml-2 text-muted-foreground text-xs">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
