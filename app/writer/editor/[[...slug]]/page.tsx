'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Editor as EditorInstance } from '@tiptap/react'
import { generateSlug, wordCount } from '@/lib/markdown'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { Spinner } from '@/components/Spinner'
import { CenteredPage } from '@/components/CenteredPage'
import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { TiptapEditor, EditorToolbar } from '@/components/TiptapEditor'
import { EditorNavbar } from '@/components/editor/EditorNavbar'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'
import { formatSavedTime } from '@/lib/utils/format'

// Success screen shown after publishing
function PublishSuccess() {
  return (
    <CenteredPage>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-section font-bold text-gray-900 dark:text-white mb-2">Published!</h2>
        <p className="text-gray-500 dark:text-gray-400">Your essay is now live</p>
      </div>
    </CenteredPage>
  )
}

export default function Editor() {
  const router = useRouter()
  const params = useParams()
  const postSlug = params.slug?.[0] as string | undefined

  // Post content state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [slug, setSlug] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [polyhedraShape, setPolyhedraShape] = useState('cube') // Fixed default, random set on mount for new posts
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isManualSlug, setIsManualSlug] = useState(false)

  // UI state
  const [loading, setLoading] = useState(!!postSlug)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showMarkdown, setShowMarkdown] = useState(false) // Toggle between WYSIWYG and raw markdown
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  
  // Adjacent posts for navigation
  const [prevSlug, setPrevSlug] = useState<string | null>(null)
  const [nextSlug, setNextSlug] = useState<string | null>(null)
  
  // Track last saved content to detect changes
  const lastSavedContent = useRef({ title: '', subtitle: '', slug: '', markdown: '', polyhedraShape: '' })
  
  // Track the current URL slug for redirect detection
  const urlSlugRef = useRef(postSlug)
  
  // Textarea ref for auto-resize (raw markdown mode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Tiptap editor instance for EditorToolbar
  const [editor, setEditor] = useState<EditorInstance | null>(null)

  // Load existing post
  useEffect(() => {
    if (!postSlug) return
    
    fetch(`/api/posts/by-slug/${postSlug}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title)
        setSubtitle(data.subtitle || '')
        setSlug(data.slug)
        setMarkdown(data.markdown)
        setPolyhedraShape(data.polyhedraShape || 'cube')
        setStatus(data.status)
        setPrevSlug(data.prevSlug)
        setNextSlug(data.nextSlug)
        setIsManualSlug(true)
        setLoading(false)
        setLastSaved(new Date(data.updatedAt))
        lastSavedContent.current = { title: data.title, subtitle: data.subtitle || '', slug: data.slug, markdown: data.markdown, polyhedraShape: data.polyhedraShape || '' }
        urlSlugRef.current = data.slug
      })
      .catch(() => {
        router.push('/writer')
      })
  }, [postSlug, router])

  // Set random shape for new posts (after mount to avoid hydration mismatch)
  useEffect(() => {
    if (!postSlug) {
      setPolyhedraShape(getRandomShape())
    }
  }, [postSlug])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isManualSlug && title) {
      setSlug(generateSlug(title))
    }
  }, [title, isManualSlug])

  // Track unsaved changes
  useEffect(() => {
    const saved = lastSavedContent.current
    const hasChanges = title !== saved.title || subtitle !== saved.subtitle || slug !== saved.slug || markdown !== saved.markdown || polyhedraShape !== saved.polyhedraShape
    setHasUnsavedChanges(hasChanges)
  }, [title, subtitle, slug, markdown, polyhedraShape])

  // Keyboard shortcuts
  useKeyboard([
    { ...SHORTCUTS.TOGGLE_VIEW, handler: () => { 
      if (status === 'published' && slug) {
        if (hasUnsavedChanges && !confirm('You have unsaved changes. Discard them?')) return
        router.push(`/e/${slug}`)
      }
    }},
    { ...SHORTCUTS.PREV, handler: () => { if (prevSlug) router.push(`/writer/editor/${prevSlug}`) } },
    { ...SHORTCUTS.NEXT, handler: () => { if (nextSlug) router.push(`/writer/editor/${nextSlug}`) } },
    { ...SHORTCUTS.ESCAPE_BACK, handler: () => router.push('/writer') },
  ])

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

    if (publishStatus === 'published' && !confirmPublish()) {
      return
    }

    setSaving(true)

    try {
      const data = { title: title.trim(), subtitle: subtitle.trim() || null, slug: slug.trim(), markdown, polyhedraShape, status: publishStatus }
      
      if (postSlug) {
        const res = await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        
        // If slug changed, redirect to new URL
        if (result.slug !== urlSlugRef.current) {
          urlSlugRef.current = result.slug
          router.replace(`/writer/editor/${result.slug}`)
        }
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
        urlSlugRef.current = result.slug
        router.push(`/writer/editor/${result.slug}`)
      }

      setStatus(publishStatus)
      setLastSaved(new Date())
      lastSavedContent.current = { title: title.trim(), subtitle: subtitle.trim(), slug: slug.trim(), markdown, polyhedraShape }
      setHasUnsavedChanges(false)

      if (publishStatus === 'published') {
        setPublishSuccess(true)
        // Hard navigate to the live essay to bypass Router Cache
        setTimeout(() => {
          window.location.href = `/e/${slug.trim()}`
        }, 1000)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [postSlug, title, subtitle, slug, markdown, polyhedraShape, router])

  // Autosave drafts after 3 seconds of inactivity
  useEffect(() => {
    if (!postSlug || !title.trim() || status === 'published') return
    
    const timeout = setTimeout(() => handleSave('draft'), 3000)
    return () => clearTimeout(timeout)
  }, [markdown, title, postSlug, status, handleSave])

  // Auto-resize textarea to fit content (only in raw markdown mode)
  useEffect(() => {
    if (!showMarkdown) return
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [markdown, showMarkdown])

  const handleUnpublish = useCallback(async () => {
    if (!confirmUnpublish(title)) return
    
    await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    router.push('/writer')
  }, [title, router])

  const handleDelete = useCallback(async () => {
    if (!postSlug) return
    if (!confirm(`Are you sure you want to delete "${title || 'this post'}"? This cannot be undone.`)) return
    
    await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
      method: 'DELETE',
    })
    router.push('/writer')
  }, [postSlug, title, router])

  // Loading state
  if (loading) {
    return (
      <CenteredPage>
        <Spinner />
      </CenteredPage>
    )
  }

  // Success state after publishing
  if (publishSuccess) {
    return <PublishSuccess />
  }

  const words = wordCount(markdown)

  return (
    <div className="h-screen flex flex-col">
      <EditorNavbar
        status={status}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onSave={handleSave}
      />

      {/* Fixed toolbar below header */}
      <EditorToolbar 
        editor={showMarkdown ? null : editor}
        textareaRef={showMarkdown ? textareaRef : undefined}
        markdown={showMarkdown ? markdown : undefined}
        onMarkdownChange={showMarkdown ? setMarkdown : undefined}
        showMarkdown={showMarkdown}
        setShowMarkdown={setShowMarkdown}
      />

      <main className="flex-1 overflow-auto pb-20">
        <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
          {/* Title and subtitle are always editable */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-title font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-2"
          />

          <input
            type="text"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Subtitle (shown on homepage)"
            className="w-full text-lg bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 text-gray-500 dark:text-gray-400 mb-8"
          />

          {/* Toggle between WYSIWYG and raw markdown */}
          {showMarkdown ? (
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              placeholder="Write your story in Markdown..."
              className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed overflow-hidden font-mono text-sm"
            />
          ) : (
            <TiptapEditor
              content={markdown}
              onChange={setMarkdown}
              placeholder="Write your story..."
              onEditorReady={setEditor}
            />
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
            {/* URL */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-14">URL</span>
                <span className="text-gray-400">/e/</span>
                {status === 'published' ? (
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    {slug}
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                ) : (
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="post-slug"
                    className="flex-1 bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 dark:text-gray-400"
                  />
                )}
              </div>
            </div>

            {/* Shape */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-14">Shape</span>
                <div className="flex items-center gap-2">
                  <PolyhedraCanvas shape={polyhedraShape} size={36} />
                  <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {polyhedraShape}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPolyhedraShape(getRandomShape())}
                className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Regenerate
              </button>
            </div>

            {/* Status */}
            {status === 'published' && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-14">Status</span>
                  <span className="text-green-600 dark:text-green-400">Published</span>
                </div>
                <button
                  type="button"
                  onClick={handleUnpublish}
                  className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  Unpublish
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-page">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{words} words</span>
          {lastSaved && (
            <span>Saved {formatSavedTime(lastSaved)}</span>
          )}
        </div>
      </footer>
    </div>
  )
}
