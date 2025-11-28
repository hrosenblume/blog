'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { renderMarkdown, generateSlug, wordCount } from '@/lib/markdown'

export default function Editor() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id?.[0] as string | undefined

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(!!postId)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isManualSlug, setIsManualSlug] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Load existing post
  useEffect(() => {
    if (!postId) return
    
    fetch(`/api/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title)
        setSlug(data.slug)
        setMarkdown(data.markdown)
        setStatus(data.status)
        setIsManualSlug(true)
        setLoading(false)
      })
      .catch(() => {
        router.push('/writer')
      })
  }, [postId, router])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isManualSlug && title) {
      setSlug(generateSlug(title))
    }
  }, [title, isManualSlug])

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setIsManualSlug(true)
  }, [])

  const handleSave = useCallback(async (publishStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    if (!slug.trim()) {
      alert('Slug is required')
      return
    }

    setSaving(true)

    try {
      const data = { title: title.trim(), slug: slug.trim(), markdown, status: publishStatus }
      
      if (postId) {
        await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (!res.ok) {
          throw new Error(result.error)
        }
        // Redirect to edit the newly created post
        router.push(`/writer/editor/${result.id}`)
      }

      setStatus(publishStatus)
      setLastSaved(new Date())

      if (publishStatus === 'published') {
        router.push('/writer')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [postId, title, slug, markdown, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  const words = wordCount(markdown)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/writer"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showPreview
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } text-gray-700 dark:text-gray-300`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>

            {status === 'draft' && (
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            )}

            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : status === 'published' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      {/* Editor/Preview */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {showPreview ? (
            <article>
              <h1 className="text-4xl font-bold mb-8">{title || 'Untitled'}</h1>
              <div 
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
            </article>
          ) : (
            <>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-8"
              />

              <textarea
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Write your story in Markdown..."
                className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed"
              />
            </>
          )}

          {/* Slug */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">URL:</span>
              <span className="text-gray-400">/e/</span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="post-slug"
                className="flex-1 bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Status bar */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>{words} words</span>
          {lastSaved && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </footer>
    </div>
  )
}

