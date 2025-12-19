'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Editor as EditorInstance } from '@tiptap/react'
import { generateSlug } from '@/lib/markdown'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'
import { useContentStash } from './useContentStash'
import type { RevisionSummary, RevisionFull, RevisionState, AIState } from './types'

interface Tag {
  id: string
  name: string
}

export interface PostContent {
  title: string
  subtitle: string
  slug: string
  markdown: string
  polyhedraShape: string
  status: 'draft' | 'published'
  // SEO fields
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  noIndex: boolean
  ogImage: string
  // Tags
  tags: Tag[]
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
  // SEO setters
  setSeoTitle: (seoTitle: string) => void
  setSeoDescription: (seoDescription: string) => void
  setSeoKeywords: (seoKeywords: string) => void
  setNoIndex: (noIndex: boolean) => void
  setOgImage: (ogImage: string) => void
  // Tags
  setTags: (tagIds: string[]) => void
  
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
  
  // Revision history
  revisions: RevisionState
  
  // AI generation
  ai: AIState
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

  // SEO state
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [noIndex, setNoIndex] = useState(false)
  const [ogImage, setOgImage] = useState('')

  // Tags state
  const [tags, setTagsState] = useState<Tag[]>([])

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
  const lastSavedContent = useRef({ title: '', subtitle: '', slug: '', markdown: '', polyhedraShape: '', seoTitle: '', seoDescription: '', seoKeywords: '', noIndex: false, ogImage: '', tagIds: [] as string[] })
  const urlSlugRef = useRef(postSlug)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Use state (not ref) so changes trigger re-render and effect runs
  const [hasEditedSinceLastSave, setHasEditedSinceLastSave] = useState(false)

  // Revision state
  const [revisions, setRevisions] = useState<RevisionSummary[]>([])
  const [revisionsLoading, setRevisionsLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewingRevision, setPreviewingRevision] = useState<RevisionFull | null>(null)
  
  // Stash for revision preview mode
  const stash = useContentStash()

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState(false)
  const aiAbortController = useRef<AbortController | null>(null)

  // Load existing post
  useEffect(() => {
    if (!postSlug) return

    fetch(`/api/posts/by-slug/${postSlug}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found')
        return res.json()
      })
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
        // SEO fields
        setSeoTitle(data.seoTitle || '')
        setSeoDescription(data.seoDescription || '')
        setSeoKeywords(data.seoKeywords || '')
        setNoIndex(data.noIndex || false)
        setOgImage(data.ogImage || '')
        // Tags
        setTagsState(data.tags || [])
        lastSavedContent.current = {
          title: data.title,
          subtitle: data.subtitle || '',
          slug: data.slug,
          markdown: data.markdown,
          polyhedraShape: data.polyhedraShape || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          seoKeywords: data.seoKeywords || '',
          noIndex: data.noIndex || false,
          ogImage: data.ogImage || '',
          tagIds: (data.tags || []).map((t: Tag) => t.id),
        }
        setHasEditedSinceLastSave(false)
        urlSlugRef.current = data.slug
      })
      .catch(() => {
        router.push('/writer')
      })
  }, [postSlug, router])

  // Set random shape for new posts (after mount to avoid hydration mismatch)
  useEffect(() => {
    if (!postSlug) {
      const shape = getRandomShape()
      setPolyhedraShape(shape)
      lastSavedContent.current.polyhedraShape = shape
    }
  }, [postSlug])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isManualSlug && title) {
      setSlug(generateSlug(title))
    }
  }, [title, isManualSlug])

  // Track unsaved changes (skip during preview mode)
  useEffect(() => {
    if (previewingRevision) return
    
    const saved = lastSavedContent.current
    const contentChanged =
      title !== saved.title ||
      subtitle !== saved.subtitle ||
      slug !== saved.slug ||
      markdown !== saved.markdown ||
      polyhedraShape !== saved.polyhedraShape ||
      seoTitle !== saved.seoTitle ||
      seoDescription !== saved.seoDescription ||
      seoKeywords !== saved.seoKeywords ||
      noIndex !== saved.noIndex ||
      ogImage !== saved.ogImage
    // Include edit flag to catch whitespace changes that get normalized away
    setHasUnsavedChanges(contentChanged || hasEditedSinceLastSave)
  }, [title, subtitle, slug, markdown, polyhedraShape, seoTitle, seoDescription, seoKeywords, noIndex, ogImage, previewingRevision, hasEditedSinceLastSave])

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

  // Handle markdown change (tracks edits for whitespace detection)
  const handleMarkdownChange = useCallback((value: string) => {
    setHasEditedSinceLastSave(true)
    setMarkdown(value)
  }, [])

  // Handle tags change (takes tagIds, updates state with full tag objects)
  const handleTagsChange = useCallback(async (tagIds: string[]) => {
    setHasEditedSinceLastSave(true)
    // Fetch available tags if we don't have them cached
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const allTags: Tag[] = await res.json()
        const selectedTags = allTags.filter(t => tagIds.includes(t.id))
        setTagsState(selectedTags)
      }
    } catch {
      // If fetch fails, just update with IDs we have
      setTagsState(prev => {
        const existing = prev.filter(t => tagIds.includes(t.id))
        return existing
      })
    }
  }, [])

  // Save handler (silent mode skips button spinner for autosave)
  const handleSave = useCallback(async (publishStatus: 'draft' | 'published', options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false

    if (!title.trim()) {
      if (!silent) alert('Title is required')
      return
    }
    if (!slug.trim()) {
      if (!silent) alert('Slug is required')
      return
    }

    if (publishStatus === 'published' && !confirmPublish()) {
      return
    }

    // Only show spinner for non-silent saves
    if (!silent) {
      setSavingAs(publishStatus)
    }
    const saveStartTime = Date.now()

    try {
      const data = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        slug: slug.trim(),
        markdown,
        polyhedraShape,
        status: publishStatus,
        // SEO fields
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        seoKeywords: seoKeywords.trim() || null,
        noIndex,
        ogImage: ogImage.trim() || null,
        // Tags
        tagIds: tags.map(t => t.id),
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
        router.replace(`/writer/editor/${result.slug}`)
      }

      setStatus(publishStatus)
      setLastSaved(new Date())
      lastSavedContent.current = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        slug: slug.trim(),
        markdown,
        polyhedraShape,
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        seoKeywords: seoKeywords.trim(),
        noIndex,
        ogImage: ogImage.trim(),
        tagIds: tags.map(t => t.id),
      }
      setHasEditedSinceLastSave(false)
      setHasUnsavedChanges(false)

      if (publishStatus === 'published') {
        setPublishSuccess(true)
        setTimeout(() => {
          window.location.href = `/e/${slug.trim()}`
        }, 1000)
      }
    } catch (err) {
      if (!silent) {
        alert(err instanceof Error ? err.message : 'Failed to save')
      }
    } finally {
      if (!silent) {
        // Ensure spinner shows for at least 400ms to avoid flash
        const elapsed = Date.now() - saveStartTime
        const minDuration = 400
        if (elapsed < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
        }
        setSavingAs(null)
      }
    }
  }, [postSlug, title, subtitle, slug, markdown, polyhedraShape, seoTitle, seoDescription, seoKeywords, noIndex, ogImage, tags, router])

  // Autosave drafts after 3 seconds of inactivity (silent - no button spinner)
  useEffect(() => {
    if (previewingRevision) return
    if (!postSlug || !title.trim() || status === 'published') return

    const timeout = setTimeout(() => handleSave('draft', { silent: true }), 3000)
    return () => clearTimeout(timeout)
  }, [markdown, title, postSlug, status, handleSave, previewingRevision])

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

  // Fetch revisions for the current post
  const fetchRevisions = useCallback(async () => {
    if (!postSlug || revisionsLoading) return
    setRevisionsLoading(true)
    try {
      const res = await fetch(`/api/posts/by-slug/${urlSlugRef.current}/revisions`)
      if (res.ok) {
        setRevisions(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch revisions:', err)
    } finally {
      setRevisionsLoading(false)
    }
  }, [postSlug, revisionsLoading])

  // Preview a revision (enter preview mode)
  const previewRevision = useCallback(async (revisionId: string) => {
    setPreviewLoading(true)
    try {
      // 1. Stash current content BEFORE making any changes
      stash.save({ title, subtitle, markdown, polyhedraShape })

      // 2. Fetch full revision
      const res = await fetch(`/api/admin/revisions/${revisionId}`)
      if (!res.ok) throw new Error('Failed to fetch revision')
      const revision: RevisionFull = await res.json()

      // 3. Update content with revision data
      setTitle(revision.title ?? '')
      setSubtitle(revision.subtitle ?? '')
      setMarkdown(revision.markdown)
      setPolyhedraShape(revision.polyhedraShape ?? stash.current?.polyhedraShape ?? 'cube')

      // 4. Directly update editor content (sync effect may not trigger due to React batching)
      if (editor) {
        const { markdownToHtml } = await import('@/lib/markdown')
        const html = markdownToHtml(revision.markdown)
        editor.commands.setContent(html, { emitUpdate: false })
      }

      // 5. Set preview state and disable editing
      setPreviewingRevision(revision)
      editor?.setEditable(false)
    } catch (err) {
      // Rollback stash on error
      stash.clear()
      alert('Failed to load revision. Please try again.')
      console.error(err)
    } finally {
      setPreviewLoading(false)
    }
  }, [title, subtitle, markdown, polyhedraShape, editor, stash])

  // Cancel preview (restore stashed content)
  const cancelPreview = useCallback(async () => {
    const stashed = stash.restore()
    if (!stashed) return

    // Restore stashed content
    setTitle(stashed.title)
    setSubtitle(stashed.subtitle)
    setMarkdown(stashed.markdown)
    setPolyhedraShape(stashed.polyhedraShape)

    // Directly update editor content
    if (editor) {
      const { markdownToHtml } = await import('@/lib/markdown')
      const html = markdownToHtml(stashed.markdown)
      editor.commands.setContent(html, { emitUpdate: false })
    }

    // Clear preview state
    setPreviewingRevision(null)

    // Re-enable editing
    editor?.setEditable(true)
  }, [editor, stash])

  // Confirm restore (save stashed content first, then apply revision)
  const confirmRestore = useCallback(async () => {
    if (!previewingRevision || !stash.current) return

    try {
      // 1. Save stashed content first (creates revision for undo)
      const saveRes = await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stash.current),
      })
      if (!saveRes.ok) throw new Error('Failed to save current content')

      // 2. Apply the revision
      const restoreRes = await fetch(`/api/admin/revisions/${previewingRevision.id}/restore`, {
        method: 'POST',
      })
      if (!restoreRes.ok) throw new Error('Failed to restore revision')

      // 3. Clear preview state
      setPreviewingRevision(null)
      stash.clear()

      // 4. Re-enable editing
      editor?.setEditable(true)

      // 5. Update UI state
      setLastSaved(new Date())
      setHasUnsavedChanges(false)

      // 6. Refresh revisions list
      fetchRevisions()
    } catch (err) {
      alert('Failed to restore revision. Please try again.')
      console.error(err)
    }
  }, [previewingRevision, editor, fetchRevisions, stash])

  // Generate content with AI (streaming)
  const generateWithAI = useCallback(async (prompt: string, wordCount: number, modelId?: string, useWebSearch?: boolean) => {
    setAiGenerating(true)
    
    // Create new AbortController for this request
    aiAbortController.current = new AbortController()
    const signal = aiAbortController.current.signal
    
    try {
      // 1. If existing post with content, save a revision first (so user can restore via history)
      const hasExistingContent = !!(title.trim() || markdown.trim())
      if (postSlug && hasExistingContent) {
        await fetch(`/api/posts/by-slug/${urlSlugRef.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, subtitle, markdown, polyhedraShape }),
        })
      }

      // 2. Clear current content and disable editing during generation
      setTitle('')
      setSubtitle('')
      setMarkdown('')
      editor?.setEditable(false)
      if (editor) {
        editor.commands.setContent('', { emitUpdate: false })
      }

      // 3. Call generate API with streaming
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, wordCount, modelId, stream: true, useWebSearch }),
        signal,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Generation failed')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      // 4. Stream content and update progressively
      const { parseGeneratedContent } = await import('@/lib/ai/parse')
      const { markdownToHtml } = await import('@/lib/markdown')

      while (true) {
        // Check if aborted before reading
        if (signal.aborted) break
        
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        // Parse incrementally to extract title/subtitle as they appear
        const parsed = parseGeneratedContent(fullContent)
        
        if (parsed.title) {
          setTitle(parsed.title)
        }
        if (parsed.subtitle) {
          setSubtitle(parsed.subtitle)
        }
        
        // Update markdown body (content after title/subtitle)
        setMarkdown(parsed.body)
        
        // Update editor content
        if (editor && parsed.body) {
          const html = markdownToHtml(parsed.body)
          editor.commands.setContent(html, { emitUpdate: false })
        }
      }

      // 5. Generation complete - content is already in place, enable editing
      editor?.setEditable(true)
      setHasEditedSinceLastSave(true)
    } catch (err) {
      // Handle abort gracefully - not an error
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped generation - keep whatever content was streamed, enable editing
        editor?.setEditable(true)
        setHasEditedSinceLastSave(true)
        return
      }
      
      // On error, re-enable editing (revision was already saved if there was content)
      editor?.setEditable(true)
      alert(err instanceof Error ? err.message : 'Generation failed')
      console.error(err)
    } finally {
      setAiGenerating(false)
      aiAbortController.current = null
    }
  }, [postSlug, title, subtitle, markdown, polyhedraShape, editor])

  // Stop AI generation in progress
  const stopAiGeneration = useCallback(() => {
    if (aiAbortController.current) {
      aiAbortController.current.abort()
    }
  }, [])

  return {
    post: { title, subtitle, slug, markdown, polyhedraShape, status, seoTitle, seoDescription, seoKeywords, noIndex, ogImage, tags },
    setTitle,
    setSubtitle,
    setSlug: handleSlugChange,
    setMarkdown: handleMarkdownChange,
    setPolyhedraShape,
    regenerateShape,
    // SEO setters
    setSeoTitle,
    setSeoDescription,
    setSeoKeywords,
    setNoIndex,
    setOgImage,
    // Tags
    setTags: handleTagsChange,
    
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
    
    revisions: {
      list: revisions,
      loading: revisionsLoading,
      previewLoading,
      previewing: previewingRevision,
      fetch: fetchRevisions,
      preview: previewRevision,
      cancel: cancelPreview,
      restore: confirmRestore,
    },
    
    ai: {
      generating: aiGenerating,
      generate: generateWithAI,
      stop: stopAiGeneration,
    },
  }
}
