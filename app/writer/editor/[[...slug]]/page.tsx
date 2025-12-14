'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { usePostEditor } from '@/lib/editor/usePostEditor'
import { PageLoader } from '@/components/PageLoader'
import { CenteredPage } from '@/components/CenteredPage'
import { TiptapEditor, EditorToolbar } from '@/components/TiptapEditor'
import { EditorNavbar } from '@/components/editor/EditorNavbar'
import { PostMetadataFooter } from '@/components/editor/PostMetadataFooter'
import { RevisionPreviewBanner } from '@/components/editor/RevisionPreviewBanner'
import { GenerateModal } from '@/components/editor/GenerateModal'
import { AIPreviewBanner } from '@/components/editor/AIPreviewBanner'
import { ChatPanel } from '@/components/ChatPanel'
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
  const postSlug = params.slug?.[0] as string | undefined

  const {
    post,
    setTitle,
    setSubtitle,
    setSlug,
    setMarkdown,
    regenerateShape,
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

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  // Chat panel state
  const [showChatPanel, setShowChatPanel] = useState(false)

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
    { ...SHORTCUTS.PREV, handler: () => { if (nav.prevSlug) router.push(`/writer/editor/${nav.prevSlug}`) } },
    { ...SHORTCUTS.NEXT, handler: () => { if (nav.nextSlug) router.push(`/writer/editor/${nav.nextSlug}`) } },
    {
      ...SHORTCUTS.ESCAPE_BACK,
      handler: () => {
        // If generating, stop the generation
        if (ai.generating) {
          ai.stop()
          return
        }
        // If in AI preview mode, discard first
        if (ai.previewing) {
          ai.discard()
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
      />

      {/* Preview info line when viewing a revision */}
      {revisions.previewing && (
        <RevisionPreviewBanner revision={revisions.previewing} />
      )}

      {/* AI preview banner */}
      {ai.previewing && (
        <AIPreviewBanner
          preview={ai.previewing}
          onAccept={ai.accept}
          onDiscard={ai.discard}
        />
      )}

      {/* Fixed toolbar below header - hidden in preview mode */}
      {!revisions.previewing && !ai.previewing && (
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
              disabled={!!revisions.previewing || !!ai.previewing}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
            />
          }
          footer={
            !revisions.previewing && !ai.previewing && (
              <PostMetadataFooter
                slug={post.slug}
                status={post.status}
                polyhedraShape={post.polyhedraShape}
                markdown={post.markdown}
                onSlugChange={setSlug}
                onShapeRegenerate={regenerateShape}
                onUnpublish={actions.unpublish}
              />
            )
          }
        >
          {/* Toggle between WYSIWYG and raw markdown */}
          {ui.showMarkdown ? (
            <textarea
              ref={textareaRef}
              value={post.markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your story in Markdown..."
              readOnly={!!revisions.previewing || !!ai.previewing}
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
          ) : ai.previewing ? (
            <span>Press Esc to discard AI draft</span>
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

      {/* Chat Panel */}
      <ChatPanel
        open={showChatPanel}
        onClose={() => setShowChatPanel(false)}
      />
    </div>
  )
}
