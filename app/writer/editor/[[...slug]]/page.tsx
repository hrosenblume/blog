'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { usePostEditor } from '@/lib/editor/usePostEditor'
import { useChatContext } from '@/lib/chat'
import { canPublish } from '@/lib/auth/helpers'
import { PageLoader } from '@/components/PageLoader'
import { CenteredPage } from '@/components/CenteredPage'
import { TiptapEditor, EditorToolbar } from '@/components/TiptapEditor'
import { EditorNavbar } from '@/components/editor/EditorNavbar'
import { PostMetadataFooter } from '@/components/editor/PostMetadataFooter'
import { RevisionPreviewBanner } from '@/components/editor/RevisionPreviewBanner'
import { GenerateModal } from '@/components/editor/GenerateModal'
import { ArticleLayout } from '@/components/ArticleLayout'
import { ArticleHeader } from '@/components/ArticleHeader'
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

  // Chat context - sync essay content for AI awareness
  const { setEssayContext, setIsOpen: setShowChatPanel } = useChatContext()

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

  // Auto-generate from idea param (from dashboard input)
  useEffect(() => {
    if (ideaParam && !postSlug && !ui.loading && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      ai.generate(ideaParam, 'medium')
      // Clear the URL param so refresh doesn't re-trigger
      router.replace('/writer/editor', { scroll: false })
    }
  }, [ideaParam, postSlug, ui.loading, ai, router])

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false)

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

  // Loading state
  if (ui.loading) {
    return <PageLoader />
  }

  // Success state after publishing
  if (ui.publishSuccess) {
    return <PublishSuccess />
  }

  return (
    <div className="h-screen flex flex-col">
      <EditorNavbar
        status={post.status}
        hasUnsavedChanges={ui.hasUnsavedChanges}
        savingAs={ui.savingAs}
        onSave={actions.save}
        previewMode={revisions.previewing ? {
          onCancel: revisions.cancel,
          onRestore: revisions.restore,
        } : undefined}
        onOpenChat={() => setShowChatPanel(true)}
        canPublish={userCanPublish}
      />

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
          onOpenGenerate={() => setShowGenerateModal(true)}
          aiGenerating={ai.generating}
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
                onSlugChange={setSlug}
                onShapeRegenerate={regenerateShape}
                onUnpublish={actions.unpublish}
                onSeoTitleChange={setSeoTitle}
                onSeoDescriptionChange={setSeoDescription}
                onSeoKeywordsChange={setSeoKeywords}
                onNoIndexChange={setNoIndex}
                onOgImageChange={setOgImage}
              />
            )
          }
        >
          {/* Loading indicator during AI generation */}
          {ai.generating && !post.markdown && (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          )}

          {/* Toggle between WYSIWYG and raw markdown */}
          {ui.showMarkdown ? (
            <textarea
              ref={textareaRef}
              value={post.markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your story in Markdown..."
              readOnly={!!revisions.previewing}
              className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed overflow-hidden font-mono text-sm"
            />
          ) : (
            <TiptapEditor
              content={post.markdown}
              onChange={setMarkdown}
              placeholder="Write your story..."
              onEditorReady={setEditor}
            />
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

      {/* Generate Modal */}
      <GenerateModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        onGenerate={ai.generate}
        generating={ai.generating}
        hasExistingContent={!!(post.title.trim() || post.markdown.trim())}
      />
    </div>
  )
}
