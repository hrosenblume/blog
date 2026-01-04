'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { AdminActionsMenu } from '@/components/admin/AdminActionsMenu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'

interface Tag {
  id: string
  name: string
  createdAt: string
  postCount: number
}

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagName, setTagName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchTags = async () => {
    const res = await fetch('/api/admin/tags')
    if (res.ok) {
      setTags(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const openCreateDialog = () => {
    setEditingTag(null)
    setTagName('')
    setError('')
    setDialogOpen(true)
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setError('')
    setDialogOpen(true)
  }

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"? This will remove it from all posts.`)) return
    const res = await fetch(`/api/admin/tags/${tag.id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchTags()
      router.refresh()
    } else {
      toast.error('Failed to delete tag')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName.trim()) {
      setError('Tag name is required')
      return
    }

    setSaving(true)
    setError('')

    const url = editingTag
      ? `/api/admin/tags/${editingTag.id}`
      : '/api/admin/tags'
    const method = editingTag ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tagName.trim() }),
    })

    if (res.ok) {
      setDialogOpen(false)
      fetchTags()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save tag')
    }

    setSaving(false)
  }

  const columns = [
    { header: 'Name', maxWidth: 'max-w-[250px]' },
    { header: 'Posts' },
    { header: 'Created' },
  ]

  const rows: AdminTableRow[] = tags.map((tag) => ({
    key: tag.id,
    cells: [
      tag.name,
      <span key="count" className="text-muted-foreground">{tag.postCount}</span>,
      <span key="created" className="text-muted-foreground">
        {new Date(tag.createdAt).toLocaleDateString()}
      </span>,
    ],
    actions: (
      <AdminActionsMenu
        actions={[
          { label: 'Edit', onClick: () => openEditDialog(tag) },
          { label: 'Delete', onClick: () => handleDelete(tag), variant: 'destructive' },
        ]}
      />
    ),
    mobileLabel: tag.name,
    mobileMeta: `${tag.postCount} posts · Created ${new Date(tag.createdAt).toLocaleDateString()}`,
  }))

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading...</div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-section font-bold">Tags</h1>
        <Button onClick={openCreateDialog}>Add Tag</Button>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No tags yet. Create one to get started."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent maxWidth="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <div className="space-y-2">
                <Label htmlFor="tagName">Name</Label>
                <Input
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. technology"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingTag ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}




