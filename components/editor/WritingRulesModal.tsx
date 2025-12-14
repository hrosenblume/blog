'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
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

interface Model {
  id: string
  name: string
  description: string
}

interface WritingRulesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WritingRulesModal({ open, onOpenChange }: WritingRulesModalProps) {
  const [rules, setRules] = useState('')
  const [defaultModel, setDefaultModel] = useState('claude-sonnet')
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch current settings when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/ai/settings')
        .then(res => res.json())
        .then(data => {
          setRules(data.rules || '')
          setDefaultModel(data.defaultModel || 'claude-sonnet')
          setModels(data.availableModels || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/ai/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, defaultModel }),
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Writing Rules</DialogTitle>
          <DialogDescription>
            Configure your AI writing assistant. These rules override everything and are injected into every generation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Model</Label>
              <Select value={defaultModel} onValueChange={setDefaultModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} — {model.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Custom Writing Rules</Label>
              <p className="text-sm text-muted-foreground">
                Be specific. These are injected at the start of every generation prompt.
              </p>
              <Textarea
                id="rules"
                value={rules}
                onChange={e => setRules(e.target.value)}
                placeholder={`- Never use "utilize" — always say "use"
- Avoid passive voice
- Start with concrete scenes, not abstractions
- Short paragraphs (3-4 sentences max)
- Use em-dashes sparingly
- End with forward motion, not tidy conclusions`}
                className="min-h-[200px] font-mono text-sm resize-none"
                disabled={saving}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={saving || loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
