'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Revision {
  id: string
  title: string | null
  subtitle: string | null
  markdown: string
  polyhedraShape: string | null
  createdAt: string
  post: {
    id: string
    title: string
    subtitle: string | null
    slug: string
    markdown: string
    polyhedraShape: string | null
  }
}

export default function RevisionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [revision, setRevision] = useState<Revision | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/revisions/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setRevision(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleRestore = async () => {
    if (!revision) return
    if (!confirm(`Restore this revision to "${revision.post.title}"?\n\nThis will replace the current title, subtitle, content, and shape.`)) return

    setRestoring(true)
    try {
      const res = await fetch(`/api/admin/revisions/${params.id}/restore`, { method: 'POST' })
      if (res.ok) {
        toast.success('Revision restored successfully!')
        router.push('/admin/revisions')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to restore')
      }
    } catch {
      toast.error('Failed to restore')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!revision) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Revision not found</p>
        <Link href="/admin/revisions" className="text-blue-500 hover:underline mt-4 inline-block">
          ← Back to revisions
        </Link>
      </div>
    )
  }

  // Check if this revision matches current post state
  const isCurrentVersion = 
    revision.markdown === revision.post.markdown &&
    revision.title === revision.post.title &&
    revision.subtitle === revision.post.subtitle &&
    revision.polyhedraShape === revision.post.polyhedraShape

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/revisions" className="text-table text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Back to revisions
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-section font-bold">
              Revision for "{revision.post.title}"
            </h1>
            <p className="text-table text-muted-foreground mt-1">
              Created {new Date(revision.createdAt).toLocaleString()} · ID: {revision.id.slice(0, 8)}...
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isCurrentVersion ? (
              <Badge>current</Badge>
            ) : (
              <Button
                onClick={handleRestore}
                disabled={restoring}
              >
                {restoring ? 'Restoring...' : 'Restore This Version'}
              </Button>
            )}
            <Button variant="secondary" asChild>
              <Link href={`/writer/editor/${revision.post.slug}`}>
                Open in Editor
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-card rounded-lg border mb-6">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium">Revision Metadata</h2>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="flex">
            <span className="w-24 md:w-32 text-table text-muted-foreground">Title</span>
            <span className="text-table">{revision.title || revision.post.title}</span>
          </div>
          <div className="flex">
            <span className="w-24 md:w-32 text-table text-muted-foreground">Subtitle</span>
            <span className="text-table">{revision.subtitle ?? revision.post.subtitle ?? '(none)'}</span>
          </div>
          <div className="flex">
            <span className="w-24 md:w-32 text-table text-muted-foreground">Shape</span>
            <span className="text-table font-mono">{revision.polyhedraShape ?? revision.post.polyhedraShape ?? '(none)'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium">Markdown Content</h2>
          <p className="text-table text-muted-foreground">
            {revision.markdown.length} characters · {revision.markdown.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
        <pre className="p-4 text-table whitespace-pre-wrap font-mono bg-muted overflow-auto max-h-[600px]">
          {revision.markdown || '(empty)'}
        </pre>
      </div>
    </div>
  )
}
