'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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

export default function AISettingsPage() {
  const [rules, setRules] = useState('')
  const [defaultModel, setDefaultModel] = useState('claude-sonnet')
  const [models, setModels] = useState<AIModelOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current settings on mount
  useEffect(() => {
    fetch('/api/ai/settings')
      .then(res => res.json())
      .then(data => {
        setRules(data.rules || '')
        setDefaultModel(data.defaultModel || 'claude-sonnet')
        setModels(data.availableModels || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/ai/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, defaultModel }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">AI Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Writing Rules</CardTitle>
          <CardDescription>
            Configure your AI writing assistant. These rules override everything and are injected into every generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultModel">Default Model</Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger className="w-full sm:w-[300px]">
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
              className="min-h-[250px] font-mono text-sm resize-none"
              disabled={saving}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
