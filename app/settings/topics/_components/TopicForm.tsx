'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TopicFormProps {
  topic?: {
    id: string
    name: string
    keywords: string
    rssFeeds: string
    isActive: boolean
    useKeywordFilter: boolean
    frequency: string
    maxPerPeriod: number
    essayFocus?: string | null
  } | null
  onSubmit: (data: {
    name: string
    keywords: string
    rssFeeds: string
    isActive: boolean
    useKeywordFilter: boolean
    frequency: string
    maxPerPeriod: number
    essayFocus: string
  }) => Promise<void>
  onClose: () => void
}

export function TopicForm({ topic, onSubmit, onClose }: TopicFormProps) {
  const isEditing = !!topic

  // Parse JSON arrays for editing
  const initialKeywords = topic ? (JSON.parse(topic.keywords) as string[]).join('\n') : ''
  const initialFeeds = topic ? (JSON.parse(topic.rssFeeds) as string[]).join('\n') : ''

  const [name, setName] = useState(topic?.name ?? '')
  const [essayFocus, setEssayFocus] = useState(topic?.essayFocus ?? '')
  const [keywords, setKeywords] = useState(initialKeywords)
  const [rssFeeds, setRssFeeds] = useState(initialFeeds)
  const [isActive, setIsActive] = useState(topic?.isActive ?? true)
  const [useKeywordFilter, setUseKeywordFilter] = useState(topic?.useKeywordFilter ?? true)
  const [frequency, setFrequency] = useState(topic?.frequency ?? 'daily')
  const [maxPerPeriod, setMaxPerPeriod] = useState(topic?.maxPerPeriod ?? 3)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await onSubmit({
        name,
        keywords,
        rssFeeds,
        isActive,
        useKeywordFilter,
        frequency,
        maxPerPeriod,
        essayFocus,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Topic' : 'New Topic'}</DialogTitle>
          <DialogDescription>
            Configure an RSS feed topic to automatically generate essay drafts
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="topic-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Topic Name</Label>
              <Input
                id="name"
                placeholder="e.g., School Lunch Policy"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="essayFocus">Essay Focus</Label>
              <p className="text-xs text-muted-foreground">
                What do you want to write about when news comes in on this topic?
              </p>
              <textarea
                id="essayFocus"
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
                placeholder="e.g., Focus on family impact. Take an advocacy stance. Challenge assumptions."
                value={essayFocus}
                onChange={e => setEssayFocus(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useKeywordFilter"
                  checked={useKeywordFilter}
                  onChange={e => setUseKeywordFilter(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="useKeywordFilter" className="font-normal">
                  Filter articles by keywords
                </Label>
              </div>
              
              {useKeywordFilter && (
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (one per line)</Label>
                  <textarea
                    id="keywords"
                    className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
                    placeholder="school lunch&#10;cafeteria&#10;USDA nutrition"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Articles matching ANY of these keywords will be included
                  </p>
                </div>
              )}
              
              {!useKeywordFilter && (
                <p className="text-xs text-muted-foreground">
                  All articles from the RSS feeds will be processed
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rssFeeds">RSS Feed URLs (one per line)</Label>
              <textarea
                id="rssFeeds"
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono"
                placeholder="https://example.com/feed.xml&#10;https://news.google.com/rss/..."
                value={rssFeeds}
                onChange={e => setRssFeeds(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPerPeriod">Max Essays per Run</Label>
                <Input
                  id="maxPerPeriod"
                  type="number"
                  min={1}
                  max={10}
                  value={maxPerPeriod}
                  onChange={e => setMaxPerPeriod(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="font-normal">
                Active (run on schedule)
              </Label>
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="topic-form" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

