'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, Loader2 } from 'lucide-react'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { usePostEditor } from '@/lib/editor/usePostEditor'
import { useChatContext, EssayEdit } from '@/lib/chat'
import { canPublish } from '@/lib/auth/helpers'
import { EditorSkeleton } from '@/components/editor/EditorSkeleton'
import { CenteredPage } from '@/components/CenteredPage'
import { TiptapEditor, EditorToolbar } from '@/components/TiptapEditor'
import { WriterNavbar } from '@/components/writer/WriterNavbar'
import { PostMetadataFooter } from '@/components/editor/PostMetadataFooter'
import { RevisionPreviewBanner } from '@/components/editor/RevisionPreviewBanner'
import { ArticleLayout } from '@/components/ArticleLayout'
import { ArticleHeader } from '@/components/ArticleHeader'
import { GeneratingSkeleton } from '@/components/editor/GeneratingSkeleton'
import { MagicBackButton } from '@/components/MagicBackButton'
import { CheckIcon } from '@/components/Icons'
import { formatSavedTime } from '@/lib/utils/format'
import { HOMEPAGE } from '@/lib/homepage'

// Success screen shown after publishing
function PublishSuccess() {
  return (
    <CenteredPage>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckIcon className="text-green-600 dark:text-green-400" />
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
  const searchParams = useSearchParams()
  const postSlug = params.slug?.[0] as string | undefined
  const ideaParam = searchParams.get('idea')
  const modelParam = searchParams.get('model')
  const lengthParam = searchParams.get('length')
  const webParam = searchParams.get('web')
  const hasTriggeredGeneration = useRef(false)
  
  const { data: session } = useSession()
  const userCanPublish = canPublish(session?.user?.role)

  const {
    post,
    setTitle,
    setSubtitle,
    setSlug,
    setMarkdown,
    regenerateShape,
    setSeoTitle,
    setSeoDescription,
    setSeoKeywords,
    setNoIndex,
    setOgImage,
    setTags,
    ui,
    setShowMarkdown,
    nav,
    actions,
    editor,
    setEditor,
    textareaRef,
    revisions,
    ai,
  } = usePostEditor(postSlug)

  // Chat context - sync essay content for AI awareness and navbar
  const { setEssayContext, isOpen: chatOpen, setIsOpen: setChatOpen, registerEditHandler } = useChatContext()

  // Keep essay context in sync with current post content
  useEffect(() => {
    if (!ui.loading) {
      setEssayContext({
        title: post.title,
        subtitle: post.subtitle,
        markdown: post.markdown,
      })
    }
    // Clear context when leaving the editor
    return () => setEssayContext(null)
  }, [post.title, post.subtitle, post.markdown, ui.loading, setEssayContext])

  // Edit handler for Agent mode - applies AI edits to the essay
  const handleAgentEdit = useCallback((edit: EssayEdit): boolean => {
    try {
      switch (edit.type) {
        case 'replace_all': {
          // Replace entire essay content
          if (edit.title !== undefined) setTitle(edit.title)
          if (edit.subtitle !== undefined) setSubtitle(edit.subtitle)
          if (edit.markdown !== undefined) setMarkdown(edit.markdown)
          return true
        }
        
        case 'replace_section': {
          // Find and replace specific text
          if (!edit.find || edit.replace === undefined) return false
          if (!post.markdown.includes(edit.find)) {
            console.warn('Agent edit: Could not find text to replace:', edit.find.substring(0, 50))
            return false
          }
          const newMarkdown = post.markdown.replace(edit.find, edit.replace)
          setMarkdown(newMarkdown)
          return true
        }
        
        case 'insert': {
          // Insert text at a specific position
          if (edit.replace === undefined) return false
          
          if (edit.position === 'start') {
            setMarkdown(edit.replace + '\n\n' + post.markdown)
            return true
          }
          if (edit.position === 'end') {
            setMarkdown(post.markdown + '\n\n' + edit.replace)
            return true
          }
          if (edit.find && (edit.position === 'before' || edit.position === 'after')) {
            if (!post.markdown.includes(edit.find)) return false
            const insertion = edit.position === 'before' 
              ? edit.replace + '\n\n' + edit.find
              : edit.find + '\n\n' + edit.replace
            const newMarkdown = post.markdown.replace(edit.find, insertion)
            setMarkdown(newMarkdown)
            return true
          }
          return false
        }
        
        case 'delete': {
          // Remove specific text
          if (!edit.find) return false
          if (!post.markdown.includes(edit.find)) return false
          const newMarkdown = post.markdown.replace(edit.find, '')
            .replace(/\n{3,}/g, '\n\n') // Clean up extra newlines
            .trim()
          setMarkdown(newMarkdown)
          return true
        }
        
        default:
          return false
      }
    } catch (err) {
      console.error('Agent edit failed:', err)
      return false
    }
  }, [post.markdown, setTitle, setSubtitle, setMarkdown])

  // Register the edit handler with chat context
  useEffect(() => {
    registerEditHandler(handleAgentEdit)
    return () => registerEditHandler(null)
  }, [registerEditHandler, handleAgentEdit])

  // Auto-generate from idea param (from dashboard input)
  useEffect(() => {
    if (ideaParam && !postSlug && !ui.loading && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      
      const wordCount = lengthParam ? parseInt(lengthParam) : 500
      const useWebSearch = webParam === '1'
      
      ai.generate(ideaParam, wordCount, modelParam || undefined, useWebSearch)
      
      // Clear the URL param so refresh doesn't re-trigger
      router.replace('/writer/editor', { scroll: false })
    }
  }, [ideaParam, postSlug, ui.loading, ai, router, modelParam, lengthParam, webParam])

  // Keyboard shortcuts
  useKeyboard([
    {
      ...SHORTCUTS.TOGGLE_VIEW,
      handler: () => {
        if (post.status === 'published' && post.slug) {
          if (ui.hasUnsavedChanges && !confirm('You have unsaved changes. Discard them?')) return
          router.push(`/e/${post.slug}`)
        }
      },
    },
    { 
      ...SHORTCUTS.PREV, 
      handler: () => { 
        if (ai.generating || revisions.previewing) return
        if (ui.hasUnsavedChanges && !confirm('You have unsaved changes. Leave anyway?')) return
        if (nav.prevSlug) router.push(`/writer/editor/${nav.prevSlug}`) 
      } 
    },
    { 
      ...SHORTCUTS.NEXT, 
      handler: () => { 
        if (ai.generating || revisions.previewing) return
        if (ui.hasUnsavedChanges && !confirm('You have unsaved changes. Leave anyway?')) return
        if (nav.nextSlug) router.push(`/writer/editor/${nav.nextSlug}`) 
      } 
    },
    {
      ...SHORTCUTS.ESCAPE_BACK,
      handler: () => {
        // If generating, stop the generation
        if (ai.generating) {
          ai.stop()
          return
        }
        // If in revision preview mode, cancel preview first
        if (revisions.previewing) {
          revisions.cancel()
          return
        }
        if (ui.hasUnsavedChanges && !confirm('You have unsaved changes. Leave anyway?')) return
        router.push('/writer')
      },
    },
  ])

  // Check for unsaved changes before navigating away (must be before conditional returns)
  const confirmLeave = useCallback(() => {
    if (ui.hasUnsavedChanges) {
      return window.confirm('You have unsaved changes. Leave anyway?')
    }
    return true
  }, [ui.hasUnsavedChanges])

  // Loading state
  if (ui.loading) {
    return <EditorSkeleton />
  }

  // Success state after publishing
  if (ui.publishSuccess) {
    return <PublishSuccess />
  }

  return (
    <div className="h-screen flex flex-col">
      {session && (
        <WriterNavbar
          session={session}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(!chatOpen)}
          fixed={false}
          leftSlot={
            <MagicBackButton 
              backLink="/writer" 
              onBeforeNavigate={confirmLeave}
            />
          }
          rightSlot={
            // Save icon only for drafts, hidden during revision preview
            !revisions.previewing && post.status === 'draft' && (
              <button
                onClick={() => actions.save('draft')}
                disabled={!ui.hasUnsavedChanges || ui.savingAs !== null}
                className="w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save draft"
                title="Save draft"
              >
                {ui.savingAs === 'draft' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            )
          }
        />
      )}

      {/* Preview info line when viewing a revision */}
      {revisions.previewing && (
        <RevisionPreviewBanner revision={revisions.previewing} />
      )}

      {/* Fixed toolbar below header - hidden in preview mode */}
      {!revisions.previewing && (
        <EditorToolbar
          editor={ui.showMarkdown ? null : editor}
          textareaRef={ui.showMarkdown ? textareaRef : undefined}
          markdown={ui.showMarkdown ? post.markdown : undefined}
          onMarkdownChange={ui.showMarkdown ? setMarkdown : undefined}
          showMarkdown={ui.showMarkdown}
          setShowMarkdown={setShowMarkdown}
          postSlug={postSlug}
          revisions={revisions}
        />
      )}

      <main className="flex-1 overflow-auto pb-20 overscroll-contain">
        <ArticleLayout
          withContainer
          className="pt-12 pb-24"
          header={
            <ArticleHeader
              title={post.title}
              subtitle={post.subtitle}
              byline={HOMEPAGE.name}
              editable
              disabled={!!revisions.previewing}
              generating={ai.generating}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
            />
          }
          footer={
            !revisions.previewing && (
              <PostMetadataFooter
                slug={post.slug}
                status={post.status}
                polyhedraShape={post.polyhedraShape}
                markdown={post.markdown}
                title={post.title}
                subtitle={post.subtitle}
                seoTitle={post.seoTitle}
                seoDescription={post.seoDescription}
                seoKeywords={post.seoKeywords}
                noIndex={post.noIndex}
                ogImage={post.ogImage}
                tags={post.tags}
                onSlugChange={setSlug}
                onShapeRegenerate={regenerateShape}
                onUnpublish={actions.unpublish}
                onPublish={() => actions.save('published')}
                savingAs={ui.savingAs}
                hasUnsavedChanges={ui.hasUnsavedChanges}
                canPublish={userCanPublish}
                onSeoTitleChange={setSeoTitle}
                onSeoDescriptionChange={setSeoDescription}
                onSeoKeywordsChange={setSeoKeywords}
                onNoIndexChange={setNoIndex}
                onOgImageChange={setOgImage}
                onTagsChange={setTags}
              />
            )
          }
        >
          {/* Skeleton placeholder during AI generation (before content arrives) */}
          {ai.generating && !post.markdown ? (
            <GeneratingSkeleton />
          ) : (
            /* Toggle between WYSIWYG and raw markdown */
            ui.showMarkdown ? (
            <textarea
              ref={textareaRef}
              value={post.markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your story in Markdown..."
              readOnly={!!revisions.previewing || ai.generating}
              className={`w-full min-h-[500px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed overflow-hidden font-mono text-base ${ai.generating ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          ) : (
            <div className={ai.generating ? 'opacity-60 cursor-not-allowed' : ''}>
              <TiptapEditor
                content={post.markdown}
                onChange={setMarkdown}
                placeholder="Write your story..."
                onEditorReady={setEditor}
              />
            </div>
            )
          )}
        </ArticleLayout>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border px-4 sm:px-6 py-3 bg-background touch-none">
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {ai.generating ? (
            <span>Press Esc to stop generating</span>
          ) : revisions.previewing ? (
            <span>Press Esc to cancel</span>
          ) : ui.lastSaved ? (
            <span>Saved {formatSavedTime(ui.lastSaved)}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      </footer>

    </div>
  )
}
