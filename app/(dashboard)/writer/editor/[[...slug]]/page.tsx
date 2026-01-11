'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { usePostEditor } from '@/lib/editor/usePostEditor'
import { useTypeToFocus } from '@/lib/editor/useTypeToFocus'
import { EDITOR_PLACEHOLDER } from '@/lib/editor/constants'
import { useChatContext, EssayEdit } from '@/lib/chat'
import { useDashboardContext } from '@/lib/dashboard'
import { canPublish } from '@/lib/auth/helpers'
import { ContentSkeleton } from '@/components/editor/EditorSkeleton'
import { CenteredPage } from '@/components/CenteredPage'
import { TiptapEditor, EditorToolbar } from '@/components/TiptapEditor'
import type { SelectionState } from '@/components/TiptapEditor'
import { PostMetadataFooter } from '@/components/editor/PostMetadataFooter'
import { RevisionPreviewBanner } from '@/components/editor/RevisionPreviewBanner'
import { CommentsPanel } from '@/components/editor/CommentsPanel'
import { ArticleLayout } from '@/components/ArticleLayout'
import { ArticleHeader } from '@/components/ArticleHeader'
import { GeneratingSkeleton } from '@/components/editor/GeneratingSkeleton'
import { CheckIcon } from '@/components/Icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  const commentParam = searchParams.get('comment')
  const fromPlanParam = searchParams.get('fromPlan')
  const hasTriggeredGeneration = useRef(false)
  const hasTriggeredPlanExpansion = useRef(false)
  const hasOpenedComment = useRef(false)
  
  const { data: session } = useSession()
  const userCanPublish = canPublish(session?.user?.role)

  // Dashboard context - register editor state for navbar
  const { registerEditor } = useDashboardContext()

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
    comments,
  } = usePostEditor(postSlug)

  // Comments panel state
  const [commentsOpen, setCommentsOpen] = useState(false)

  // Open comments panel from URL param (e.g., from settings page)
  useEffect(() => {
    if (commentParam && !hasOpenedComment.current && !ui.loading) {
      hasOpenedComment.current = true
      comments.setActiveId(commentParam)
      setCommentsOpen(true)
      // Clear the URL param
      router.replace(`/writer/editor/${postSlug}`, { scroll: false })
    }
  }, [commentParam, ui.loading, comments, router, postSlug])
  
  // Publish confirmation dialog (for resolving comments)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  // Chat context - sync essay content for AI awareness
  const { setEssayContext, registerEditHandler, registerExpandPlanHandler, addMessage, setMode } = useChatContext()

  // Check for unsaved changes before navigating away (must be before conditional returns)
  const confirmLeave = useCallback(() => {
    if (ui.hasUnsavedChanges) {
      return window.confirm('You have unsaved changes. Leave anyway?')
    }
    return true
  }, [ui.hasUnsavedChanges])

  // Register editor state with dashboard context for navbar integration
  useEffect(() => {
    if (!ui.loading && !revisions.previewing) {
      registerEditor({
        hasUnsavedChanges: ui.hasUnsavedChanges,
        status: post.status as 'draft' | 'published',
        savingAs: ui.savingAs,
        onSave: actions.save,
        confirmLeave,
      })
    } else {
      registerEditor(null)
    }
    
    return () => registerEditor(null)
  }, [ui.loading, ui.hasUnsavedChanges, ui.savingAs, post.status, revisions.previewing, actions.save, confirmLeave, registerEditor])

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

  // Expand plan handler - generates full essay from plan outline
  const handleExpandPlan = useCallback((plan: string, wordCount: number) => {
    // Log to chat
    addMessage('user', 'Draft essay from plan')
    
    // Generate the essay using expand_plan mode (uses the customizable expand plan template)
    ai.generate(plan, wordCount, undefined, false, 'expand_plan')
      .then((status) => {
        if (status === 'complete') {
          addMessage('assistant', 'Essay drafted from your plan.')
        } else if (status === 'stopped') {
          addMessage('assistant', 'Essay generation was stopped. Any content generated is on the canvas.')
        } else {
          addMessage('assistant', 'Essay generation failed. Any partial content is on the canvas.')
        }
      })
  }, [ai, addMessage])

  // Register the expand plan handler with chat context
  useEffect(() => {
    registerExpandPlanHandler(handleExpandPlan)
    return () => registerExpandPlanHandler(null)
  }, [registerExpandPlanHandler, handleExpandPlan])

  // Auto-generate from idea param (from dashboard input)
  useEffect(() => {
    if (ideaParam && !postSlug && !ui.loading && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      
      const wordCount = lengthParam ? parseInt(lengthParam) : 500
      const useWebSearch = webParam === '1'
      
      // Log prompt to chat
      addMessage('user', `Generate essay: ${ideaParam}`)
      
      // Generate and log result based on outcome
      ai.generate(ideaParam, wordCount, modelParam || undefined, useWebSearch)
        .then((status) => {
          if (status === 'complete') {
            addMessage('assistant', 'Essay generation complete.')
          } else if (status === 'stopped') {
            addMessage('assistant', 'Essay generation was stopped. Any content generated is on the canvas.')
          } else {
            addMessage('assistant', 'Essay generation failed. Any partial content is on the canvas.')
          }
        })
      
      // Clear the URL param so refresh doesn't re-trigger
      router.replace('/writer/editor', { scroll: false })
    }
  }, [ideaParam, postSlug, ui.loading, ai, router, modelParam, lengthParam, webParam, addMessage])

  // Auto-expand plan from sessionStorage (from dashboard Plan mode)
  useEffect(() => {
    if (fromPlanParam && !postSlug && !ui.loading && !hasTriggeredPlanExpansion.current) {
      const plan = sessionStorage.getItem('pendingPlan')
      if (plan) {
        hasTriggeredPlanExpansion.current = true
        sessionStorage.removeItem('pendingPlan')
        
        const wordCount = 800

        addMessage('user', 'Draft essay from plan')
        
        // Use expand_plan mode which uses the customizable expand plan template
        ai.generate(plan, wordCount, undefined, false, 'expand_plan')
          .then((status) => {
            if (status === 'complete') {
              addMessage('assistant', 'Essay drafted from your plan.')
            } else if (status === 'stopped') {
              addMessage('assistant', 'Essay generation was stopped. Any content generated is on the canvas.')
            } else {
              addMessage('assistant', 'Essay generation failed. Any partial content is on the canvas.')
            }
            // Switch to agent mode for editing
            setMode('agent')
          })
        
        // Clear the URL param so refresh doesn't re-trigger
        router.replace('/writer/editor', { scroll: false })
      }
    }
  }, [fromPlanParam, postSlug, ui.loading, ai, router, addMessage, setMode])

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
    {
      ...SHORTCUTS.ADD_COMMENT,
      handler: () => {
        // Only open comments panel if text is selected
        if (comments.selectedText) {
          setCommentsOpen(true)
        }
      },
    },
  ])

  // Focus editor when typing with nothing focused
  useTypeToFocus(editor, !ui.loading && !ai.generating && !revisions.previewing)

  // Handle publish - check for open comments first
  const handlePublish = useCallback(() => {
    if (comments.openCount > 0) {
      setShowPublishDialog(true)
    } else {
      actions.save('published')
    }
  }, [comments.openCount, actions])

  // Publish after resolving all comments (skip confirm since user already confirmed via dialog)
  const handleResolveAndPublish = useCallback(async () => {
    setShowPublishDialog(false)
    await comments.resolveAll()
    actions.save('published', { skipConfirm: true })
  }, [comments, actions])

  // Publish without resolving comments (skip confirm since user already confirmed via dialog)
  const handlePublishAnyway = useCallback(() => {
    setShowPublishDialog(false)
    actions.save('published', { skipConfirm: true })
  }, [actions])

  // Success state after publishing
  if (ui.publishSuccess) {
    return <PublishSuccess />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview info line when viewing a revision */}
      {!ui.loading && revisions.previewing && (
        <RevisionPreviewBanner 
          revision={revisions.previewing} 
          onCancel={revisions.cancel}
          onRestore={revisions.restore}
        />
      )}

      {/* Toolbar - shows loading skeleton while post data loads */}
      {!revisions.previewing && (
        <EditorToolbar
          loading={ui.loading}
          editor={ui.showMarkdown ? null : editor}
          textareaRef={ui.showMarkdown ? textareaRef : undefined}
          markdown={ui.showMarkdown ? post.markdown : undefined}
          onMarkdownChange={ui.showMarkdown ? setMarkdown : undefined}
          showMarkdown={ui.showMarkdown}
          setShowMarkdown={setShowMarkdown}
          postSlug={postSlug}
          revisions={revisions}
          aiGenerating={ai.generating}
          hasSelection={!!comments.selectedText && !comments.selectedText.hasExistingComment}
          selectionHasComment={comments.selectedText?.hasExistingComment}
          onAddComment={() => setCommentsOpen(true)}
          commentsCount={comments.list.filter(c => !c.resolved).length}
          onViewComments={() => setCommentsOpen(true)}
        />
      )}

      <main className="flex-1 overflow-auto pb-20 overscroll-contain">
        {/* Content skeleton while post data loads */}
        {ui.loading ? (
          <ContentSkeleton />
        ) : (
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
                onPublish={handlePublish}
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
              placeholder={EDITOR_PLACEHOLDER}
              readOnly={!!revisions.previewing || ai.generating}
              className={`w-full min-h-[500px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed overflow-hidden font-mono text-base ${ai.generating ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          ) : (
            <div className={ai.generating ? 'opacity-60 cursor-not-allowed' : ''}>
              <TiptapEditor
                content={post.markdown}
                onChange={setMarkdown}
                placeholder={EDITOR_PLACEHOLDER}
                autoFocus={!postSlug}
                onEditorReady={setEditor}
                onSelectionChange={(sel: SelectionState | null) => {
                  if (sel?.hasSelection) {
                    comments.setSelectedText({ 
                      text: sel.text, 
                      from: sel.from, 
                      to: sel.to,
                      hasExistingComment: sel.hasExistingComment,
                    })
                  } else {
                    comments.setSelectedText(null)
                  }
                }}
                onCommentClick={(commentId: string) => {
                  comments.setActiveId(commentId)
                  setCommentsOpen(true)
                }}
              />
            </div>
            )
          )}
        </ArticleLayout>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border px-4 sm:px-6 py-3 bg-background touch-none">
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {ui.loading ? (
            <span>&nbsp;</span>
          ) : ai.generating ? (
            <button 
              onClick={() => ai.stop()} 
              className="hover:text-foreground transition-colors"
            >
              Press Esc to stop generating
            </button>
          ) : revisions.previewing ? (
            <button 
              onClick={() => revisions.cancel()} 
              className="hover:text-foreground transition-colors"
            >
              Press Esc to cancel
            </button>
          ) : ui.lastSaved ? (
            <span>Saved {formatSavedTime(ui.lastSaved)}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      </footer>

      {/* Comments Panel */}
      {session?.user?.email && (
        <CommentsPanel
          comments={comments.list}
          currentUserEmail={session.user.email}
          isAdmin={session.user.role === 'admin'}
          selectedText={comments.selectedText?.text ?? null}
          onCreateComment={comments.create}
          onReply={comments.reply}
          onEdit={comments.edit}
          onDelete={comments.remove}
          onResolve={comments.resolve}
          onCommentClick={comments.scrollTo}
          activeCommentId={comments.activeId}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onClearSelection={() => comments.setSelectedText(null)}
        />
      )}

      {/* Publish confirmation dialog for open comments */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {comments.openCount} open comment{comments.openCount !== 1 ? 's' : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to resolve all comments before publishing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishAnyway}
              className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground text-foreground"
            >
              Publish anyway
            </AlertDialogAction>
            <AlertDialogAction onClick={handleResolveAndPublish}>
              Resolve & publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

