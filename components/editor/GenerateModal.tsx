'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AIModelOption } from '@/lib/ai/models'

interface GenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (prompt: string, length: string, modelId?: string) => Promise<void>
  generating: boolean
  hasExistingContent?: boolean
}

export function GenerateModal({
  open,
  onOpenChange,
  onGenerate,
  generating,
  hasExistingContent = false,
}: GenerateModalProps) {
  const [prompt, setPrompt] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [modelId, setModelId] = useState<string>('')
  const [models, setModels] = useState<AIModelOption[]>([])
  const [defaultModel, setDefaultModel] = useState<string>('claude-sonnet')

  // Fetch available models and default on mount
  useEffect(() => {
    if (open) {
      fetch('/api/ai/settings')
        .then(res => res.json())
        .then(data => {
          setModels(data.availableModels || [])
          setDefaultModel(data.defaultModel || 'claude-sonnet')
          if (!modelId) {
            setModelId(data.defaultModel || 'claude-sonnet')
          }
        })
        .catch(console.error)
    }
  }, [open, modelId])

  const handleSubmit = () => {
    if (!prompt.trim()) return
    
    // Warn if there's existing content that will be replaced
    if (hasExistingContent) {
      const confirmed = window.confirm(
        'This will replace your current content. The original will be saved so you can restore it if needed.\n\nContinue?'
      )
      if (!confirmed) return
    }
    
    // Close modal immediately, start generation in background
    setPrompt('')
    onOpenChange(false)
    onGenerate(prompt.trim(), length, modelId || undefined)
  }

  // Handle Esc key to close modal without triggering editor shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onOpenChange(false)
    }
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullscreenMobile onKeyDown={handleKeyDown}>
        {/* X close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          disabled={generating}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle>Generate with AI</DialogTitle>
        </DialogHeader>

        {/* -mx-1 px-1 creates space for focus rings without clipping */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 -mx-1 px-1">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                    {model.id === defaultModel && ' (default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">What do you want to write about?</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the essay you want to generate..."
              className="min-h-[120px] resize-none"
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label>Length</Label>
            <Select value={length} onValueChange={(val) => setLength(val as 'short' | 'medium' | 'long')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (~500 words)</SelectItem>
                <SelectItem value="medium">Medium (~1000 words)</SelectItem>
                <SelectItem value="long">Long (~2000 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!prompt.trim() || generating}>
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
