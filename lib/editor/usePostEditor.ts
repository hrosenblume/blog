'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Editor as EditorInstance } from '@tiptap/react'
import { generateSlug } from '@/lib/markdown'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'

export interface PostContent {
  title: string
  subtitle: string
  slug: string
  markdown: string
  polyhedraShape: string
  status: 'draft' | 'published'
}

export interface PostEditorUI {
  loading: boolean
  savingAs: 'draft' | 'published' | null
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  showMarkdown: boolean
  publishSuccess: boolean
}

export interface PostEditorNav {
  prevSlug: string | null
  nextSlug: string | null
}

export interface PostEditorActions {
  save: (status: 'draft' | 'published') => Promise<void>
  unpublish: () => Promise<void>
  delete: () => Promise<void>
}

export interface UsePostEditorReturn {
  // Post content
  post: PostContent
  setTitle: (title: string) => void
  setSubtitle: (subtitle: string) => void
  setSlug: (slug: string) => void
  setMarkdown: (markdown: string) => void
  setPolyhedraShape: (shape: string) => void
  regenerateShape: () => void
  
  // UI state
  ui: PostEditorUI
  setShowMarkdown: (show: boolean) => void
  
  // Navigation
  nav: PostEditorNav
  
  // Actions
  actions: PostEditorActions
  
  // Editor instance (for Tiptap)
  editor: EditorInstance | null
  setEditor: (editor: EditorInstance | null) => void
  
  // Refs
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  
  // Helpers
  isManualSlug: boolean
}

export function usePostEditor(postSlug: string | undefined): UsePostEditorReturn {
  const router = useRouter()

  // Post content state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [slug, setSlug] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [polyhedraShape, setPolyhedraShape] = useState('cube')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isManualSlug, setIsManualSlug] = useState(false)

  // UI state
  const [loading, setLoading] = useState(!!postSlug)
  const [savingAs, setSavingAs] = useState<'draft' | 'published' | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)

  // Navigation
  const [prevSlug, setPrevSlug] = useState<string | null>(null)
  const [nextSlug, setNextSlug] = useState<string | null>(null)

  // Editor instance
  const [editor, setEditor] = useState<EditorInstance | null>(null)

  // Refs
  const lastSavedContent = useRef({ title: '', subtitle: '', slug: '', markdown: '', polyhedraShape: '' })
  const urlSlugRef = useRef(postSlug)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        lastSavedContent.current = {
          title: data.title,
          subtitle: data.subtitle || '',
          slug: data.slug,
          markdown: data.markdown,
          polyhedraShape: data.polyhedraShape || '',
        }
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
    const hasChanges =
      title !== saved.title ||
      subtitle !== saved.subtitle ||
      slug !== saved.slug ||
      markdown !== saved.markdown ||
      polyhedraShape !== saved.polyhedraShape
    setHasUnsavedChanges(hasChanges)
  }, [title, subtitle, slug, markdown, polyhedraShape])

  // Browser back/refresh warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Auto-resize textarea (raw markdown mode)
  useEffect(() => {
    if (!showMarkdown) return
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [markdown, showMarkdown])

  // Handle slug change (marks as manual)
  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setIsManualSlug(true)
  }, [])

  // Save handler
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

    setSavingAs(publishStatus)
    const saveStartTime = Date.now()

    try {
      const data = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        slug: slug.trim(),
        markdown,
        polyhedraShape,
        status: publishStatus,
      }

      if (postSlug) {
        const res = await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()

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
      lastSavedContent.current = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        slug: slug.trim(),
        markdown,
        polyhedraShape,
      }
      setHasUnsavedChanges(false)

      if (publishStatus === 'published') {
        setPublishSuccess(true)
        setTimeout(() => {
          window.location.href = `/e/${slug.trim()}`
        }, 1000)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      // Ensure spinner shows for at least 400ms to avoid flash
      const elapsed = Date.now() - saveStartTime
      const minDuration = 400
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
      }
      setSavingAs(null)
    }
  }, [postSlug, title, subtitle, slug, markdown, polyhedraShape, router])

  // Autosave drafts after 3 seconds of inactivity
  useEffect(() => {
    if (!postSlug || !title.trim() || status === 'published') return

    const timeout = setTimeout(() => handleSave('draft'), 3000)
    return () => clearTimeout(timeout)
  }, [markdown, title, postSlug, status, handleSave])

  // Unpublish handler
  const handleUnpublish = useCallback(async () => {
    if (!confirmUnpublish(title)) return

    await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    router.push('/writer')
  }, [title, router])

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!postSlug) return
    if (!confirm(`Are you sure you want to delete "${title || 'this post'}"? This cannot be undone.`)) return

    await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
      method: 'DELETE',
    })
    router.push('/writer')
  }, [postSlug, title, router])

  // Regenerate shape
  const regenerateShape = useCallback(() => {
    setPolyhedraShape(getRandomShape())
  }, [])

  return {
    post: { title, subtitle, slug, markdown, polyhedraShape, status },
    setTitle,
    setSubtitle,
    setSlug: handleSlugChange,
    setMarkdown,
    setPolyhedraShape,
    regenerateShape,
    
    ui: { loading, savingAs, lastSaved, hasUnsavedChanges, showMarkdown, publishSuccess },
    setShowMarkdown,
    
    nav: { prevSlug, nextSlug },
    
    actions: {
      save: handleSave,
      unpublish: handleUnpublish,
      delete: handleDelete,
    },
    
    editor,
    setEditor,
    
    textareaRef,
    
    isManualSlug,
  }
}

