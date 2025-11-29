'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
        alert('Revision restored successfully!')
        router.push('/admin/revisions')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to restore')
      }
    } catch {
      alert('Failed to restore')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!revision) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Revision not found</p>
        <Link href="/admin/revisions" className="text-blue-600 hover:underline mt-4 inline-block">
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/revisions" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block">
            ← Back to revisions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revision for "{revision.post.title}"
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Created {new Date(revision.createdAt).toLocaleString()} · ID: {revision.id.slice(0, 8)}...
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isCurrentVersion ? (
            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
              Current Version
            </span>
          ) : (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {restoring ? 'Restoring...' : 'Restore This Version'}
            </button>
          )}
          <Link
            href={`/writer/editor/${revision.post.slug}`}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Open in Editor
          </Link>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Revision Metadata</h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="flex">
            <span className="w-32 text-sm text-gray-500 dark:text-gray-400">Title</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {revision.title || revision.post.title}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-sm text-gray-500 dark:text-gray-400">Subtitle</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {revision.subtitle ?? revision.post.subtitle ?? '(none)'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-sm text-gray-500 dark:text-gray-400">Shape</span>
            <span className="text-sm text-gray-900 dark:text-white font-mono">
              {revision.polyhedraShape ?? revision.post.polyhedraShape ?? '(none)'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Markdown Content</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {revision.markdown.length} characters · {revision.markdown.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
        <pre className="p-6 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[600px]">
          {revision.markdown || '(empty)'}
        </pre>
      </div>
    </div>
  )
}
