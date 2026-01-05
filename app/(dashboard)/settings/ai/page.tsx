'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, ChevronDown, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { AIModelOption } from '@/lib/ai/models'

export default function AISettingsPage() {
  const [rules, setRules] = useState('')
  const [chatRules, setChatRules] = useState('')
  const [rewriteRules, setRewriteRules] = useState('')
  const [autoDraftRules, setAutoDraftRules] = useState('')
  const [autoDraftWordCount, setAutoDraftWordCount] = useState(800)
  const [defaultModel, setDefaultModel] = useState('claude-sonnet')
  const [models, setModels] = useState<AIModelOption[]>([])
  const [generateTemplate, setGenerateTemplate] = useState<string | null>(null)
  const [chatTemplate, setChatTemplate] = useState<string | null>(null)
  const [rewriteTemplate, setRewriteTemplate] = useState<string | null>(null)
  const [autoDraftTemplate, setAutoDraftTemplate] = useState<string | null>(null)
  const [defaultGenerateTemplate, setDefaultGenerateTemplate] = useState('')
  const [defaultChatTemplate, setDefaultChatTemplate] = useState('')
  const [defaultRewriteTemplate, setDefaultRewriteTemplate] = useState('')
  const [defaultAutoDraftTemplate, setDefaultAutoDraftTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current settings on mount
  useEffect(() => {
    fetch('/api/ai/settings')
      .then(res => res.json())
      .then(data => {
        setRules(data.rules || '')
        setChatRules(data.chatRules || '')
        setRewriteRules(data.rewriteRules || '')
        setAutoDraftRules(data.autoDraftRules || '')
        setAutoDraftWordCount(data.autoDraftWordCount ?? 800)
        setDefaultModel(data.defaultModel || 'claude-sonnet')
        setModels(data.availableModels || [])
        setGenerateTemplate(data.generateTemplate)
        setChatTemplate(data.chatTemplate)
        setRewriteTemplate(data.rewriteTemplate)
        setAutoDraftTemplate(data.autoDraftTemplate)
        setDefaultGenerateTemplate(data.defaultGenerateTemplate || '')
        setDefaultChatTemplate(data.defaultChatTemplate || '')
        setDefaultRewriteTemplate(data.defaultRewriteTemplate || '')
        setDefaultAutoDraftTemplate(data.defaultAutoDraftTemplate || '')
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
        body: JSON.stringify({ 
          rules, 
          chatRules,
          rewriteRules,
          autoDraftRules,
          autoDraftWordCount,
          defaultModel,
          generateTemplate,
          chatTemplate,
          rewriteTemplate,
          autoDraftTemplate,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Get the effective template (custom or default)
  const effectiveGenerateTemplate = generateTemplate ?? defaultGenerateTemplate
  const effectiveChatTemplate = chatTemplate ?? defaultChatTemplate
  const effectiveRewriteTemplate = rewriteTemplate ?? defaultRewriteTemplate
  const effectiveAutoDraftTemplate = autoDraftTemplate ?? defaultAutoDraftTemplate

  // Check if using custom template
  const isCustomGenerateTemplate = generateTemplate !== null
  const isCustomChatTemplate = chatTemplate !== null
  const isCustomRewriteTemplate = rewriteTemplate !== null
  const isCustomAutoDraftTemplate = autoDraftTemplate !== null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">AI Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>
            Configure your AI writing assistant. Writing rules apply to essay generation; chat rules control how the assistant behaves during brainstorming.
            To configure API keys, go to{' '}
            <Link href="/settings/integrations" className="underline hover:text-foreground">
              Integrations
            </Link>.
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
            <Label htmlFor="rules">Essay Writing Rules</Label>
            <p className="text-sm text-muted-foreground">
              Style and format rules for generated essays. Applied when generating or rewriting content.
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
              className="min-h-[180px] font-mono text-sm resize-none"
              disabled={saving}
            />
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-180" />
                {isCustomGenerateTemplate ? 'Edit prompt template (customized)' : 'Edit prompt template'}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: <code className="bg-muted px-1 rounded">{'{{RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{STYLE_EXAMPLES}}'}</code>
                    </p>
                    {isCustomGenerateTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGenerateTemplate(null)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset to default
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={effectiveGenerateTemplate}
                    onChange={e => setGenerateTemplate(e.target.value)}
                    className="min-h-[250px] font-mono text-xs resize-none"
                    disabled={saving}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatRules">Chat Behavior Rules</Label>
            <p className="text-sm text-muted-foreground">
              How the assistant should behave during brainstorming conversations. Controls personality and interaction style.
            </p>
            <Textarea
              id="chatRules"
              value={chatRules}
              onChange={e => setChatRules(e.target.value)}
              placeholder={`- Be direct and concise
- Push back on vague ideas
- Ask clarifying questions before drafting
- Challenge my assumptions
- Don't be sycophantic`}
              className="min-h-[140px] font-mono text-sm resize-none"
              disabled={saving}
            />
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-180" />
                {isCustomChatTemplate ? 'Edit prompt template (customized)' : 'Edit prompt template'}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: <code className="bg-muted px-1 rounded">{'{{RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{CHAT_RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{STYLE_EXAMPLES}}'}</code>
                    </p>
                    {isCustomChatTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChatTemplate(null)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset to default
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={effectiveChatTemplate}
                    onChange={e => setChatTemplate(e.target.value)}
                    className="min-h-[300px] font-mono text-xs resize-none"
                    disabled={saving}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewriteRules">Rewrite Rules</Label>
            <p className="text-sm text-muted-foreground">
              Rules for cleaning up selected text with the rewrite tool. Controls how content is polished.
            </p>
            <Textarea
              id="rewriteRules"
              value={rewriteRules}
              onChange={e => setRewriteRules(e.target.value)}
              placeholder={`- Keep the same meaning, improve clarity
- Maintain sentence length variety
- Remove filler words
- Don't add new ideas`}
              className="min-h-[140px] font-mono text-sm resize-none"
              disabled={saving}
            />
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-180" />
                {isCustomRewriteTemplate ? 'Edit prompt template (customized)' : 'Edit prompt template'}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: <code className="bg-muted px-1 rounded">{'{{RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{REWRITE_RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{STYLE_EXAMPLES}}'}</code>
                    </p>
                    {isCustomRewriteTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRewriteTemplate(null)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset to default
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={effectiveRewriteTemplate}
                    onChange={e => setRewriteTemplate(e.target.value)}
                    className="min-h-[250px] font-mono text-xs resize-none"
                    disabled={saving}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoDraftRules">Auto-Draft Rules</Label>
            <p className="text-sm text-muted-foreground">
              Rules for generating essays from news articles via RSS feeds. Controls how topics are transformed into original essays.
            </p>
            <Textarea
              id="autoDraftRules"
              value={autoDraftRules}
              onChange={e => setAutoDraftRules(e.target.value)}
              placeholder={`- Write original perspectives, don't summarize
- Take a contrarian angle when appropriate
- Include personal insights and experiences
- Focus on implications, not just facts`}
              className="min-h-[140px] font-mono text-sm resize-none"
              disabled={saving}
            />
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="autoDraftWordCount" className="text-sm whitespace-nowrap">Target word count:</Label>
                <Input
                  id="autoDraftWordCount"
                  type="number"
                  min={200}
                  max={3000}
                  value={autoDraftWordCount}
                  onChange={e => setAutoDraftWordCount(parseInt(e.target.value) || 800)}
                  className="w-24"
                  disabled={saving}
                />
              </div>
            </div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-180" />
                {isCustomAutoDraftTemplate ? 'Edit prompt template (customized)' : 'Edit prompt template'}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: <code className="bg-muted px-1 rounded">{'{{AUTO_DRAFT_RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{AUTO_DRAFT_WORD_COUNT}}'}</code>, <code className="bg-muted px-1 rounded">{'{{RULES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{STYLE_EXAMPLES}}'}</code>, <code className="bg-muted px-1 rounded">{'{{TOPIC_NAME}}'}</code>, <code className="bg-muted px-1 rounded">{'{{ARTICLE_TITLE}}'}</code>, <code className="bg-muted px-1 rounded">{'{{ARTICLE_SUMMARY}}'}</code>, <code className="bg-muted px-1 rounded">{'{{ARTICLE_URL}}'}</code>
                    </p>
                    {isCustomAutoDraftTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoDraftTemplate(null)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset to default
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={effectiveAutoDraftTemplate}
                    onChange={e => setAutoDraftTemplate(e.target.value)}
                    className="min-h-[300px] font-mono text-xs resize-none"
                    disabled={saving}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
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
