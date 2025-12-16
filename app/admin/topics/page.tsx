'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Play, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminTable, type AdminTableColumn, type AdminTableRow } from '@/components/admin/AdminTable'
import { AdminActionsMenu } from '@/components/admin/AdminActionsMenu'
import { TopicForm } from './_components/TopicForm'

interface Topic {
  id: string
  name: string
  keywords: string
  rssFeeds: string
  isActive: boolean
  useKeywordFilter: boolean
  frequency: string
  maxPerPeriod: number
  essayFocus: string | null
  lastRunAt: string | null
  createdAt: string
  newsItemCount: number
  postCount: number
}

const columns: AdminTableColumn[] = [
  { header: 'Name' },
  { header: 'Keywords' },
  { header: 'Frequency' },
  { header: 'Stats' },
  { header: 'Last Run' },
]

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null) // 'all' or topic id
  const [showForm, setShowForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics')
      const data = await res.json()
      setTopics(data)
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  const handleGenerateAll = async () => {
    setGenerating('all')
    try {
      const res = await fetch('/api/admin/topics/generate', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        const total = data.results.reduce((sum: number, r: { generated: number }) => sum + r.generated, 0)
        alert(`Generated ${total} essays across ${data.results.length} topics`)
        fetchTopics()
      } else {
        alert(data.error || 'Generation failed')
      }
    } catch (error) {
      alert('Generation failed')
      console.error(error)
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateTopic = async (topicId: string) => {
    setGenerating(topicId)
    try {
      const res = await fetch(`/api/admin/topics/generate/${topicId}`, { method: 'POST' })
      const data = await res.json()
      if (data.success && data.results[0]) {
        alert(`Generated ${data.results[0].generated} essays for ${data.results[0].topicName}`)
        fetchTopics()
      } else {
        alert(data.error || 'Generation failed')
      }
    } catch (error) {
      alert('Generation failed')
      console.error(error)
    } finally {
      setGenerating(null)
    }
  }

  const handleDelete = async (topicId: string) => {
    if (!confirm('Delete this topic? This will also delete all associated news items.')) return
    
    try {
      await fetch(`/api/admin/topics/${topicId}`, { method: 'DELETE' })
      setTopics(topics.filter(t => t.id !== topicId))
    } catch (error) {
      alert('Failed to delete topic')
      console.error(error)
    }
  }

  const handleFormSubmit = async (data: {
    name: string
    keywords: string
    rssFeeds: string
    isActive: boolean
    frequency: string
    maxPerPeriod: number
    essayFocus: string
  }) => {
    try {
      if (editingTopic) {
        // Update existing
        const res = await fetch(`/api/admin/topics/${editingTopic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update')
      } else {
        // Create new
        const res = await fetch('/api/admin/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create')
      }
      
      setShowForm(false)
      setEditingTopic(null)
      fetchTopics()
    } catch (error) {
      alert(editingTopic ? 'Failed to update topic' : 'Failed to create topic')
      console.error(error)
    }
  }

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTopic(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const rows: AdminTableRow[] = topics.map(topic => {
    const keywords = JSON.parse(topic.keywords) as string[]
    const feeds = JSON.parse(topic.rssFeeds) as string[]
    
    return {
      key: topic.id,
      cells: [
        <div key="name" className="flex items-center gap-2">
          <span className={topic.isActive ? '' : 'text-muted-foreground'}>{topic.name}</span>
          {!topic.isActive && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Inactive</span>
          )}
        </div>,
        <span key="keywords" className="text-sm text-muted-foreground">
          {keywords.slice(0, 3).join(', ')}
          {keywords.length > 3 && ` +${keywords.length - 3}`}
        </span>,
        <span key="frequency" className="capitalize">{topic.frequency}</span>,
        <span key="stats" className="text-sm text-muted-foreground">
          {topic.postCount} essays / {feeds.length} feeds
        </span>,
        <span key="lastRun" className="text-sm text-muted-foreground">
          {topic.lastRunAt ? new Date(topic.lastRunAt).toLocaleDateString() : 'Never'}
        </span>,
      ],
      mobileLabel: topic.name,
      mobileMeta: `${topic.frequency} • ${topic.postCount} essays`,
      mobileBadge: !topic.isActive ? (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Inactive</span>
      ) : null,
      actions: (
        <AdminActionsMenu
          actions={[
            {
              label: generating === topic.id ? 'Generating...' : 'Generate',
              icon: <Play className="h-4 w-4" />,
              onClick: () => handleGenerateTopic(topic.id),
              disabled: generating !== null,
            },
            {
              label: 'Edit',
              icon: <Pencil className="h-4 w-4" />,
              onClick: () => handleEdit(topic),
            },
            {
              label: 'Delete',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDelete(topic.id),
              variant: 'destructive',
            },
          ]}
        />
      ),
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Topics</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateAll}
            disabled={generating !== null || topics.length === 0}
          >
            {generating === 'all' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Generate All
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Topic Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Configure RSS feeds and keywords to automatically generate essay drafts
          </p>
        </div>
        <AdminTable
          columns={columns}
          rows={rows}
          emptyMessage="No topics configured. Create one to start generating essays."
        />
      </div>

      {showForm && (
        <TopicForm
          topic={editingTopic}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

