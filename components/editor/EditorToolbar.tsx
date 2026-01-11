'use client'

import type { RefObject } from 'react'
import type { Editor } from '@tiptap/react'
import { MessageSquarePlus, MessageSquare } from 'lucide-react'
import { ToolbarButton, Divider, SkeletonButton } from './toolbar/ToolbarButton'
import { FormatButtons } from './toolbar/FormatButtons'
import { BlockButtons } from './toolbar/BlockButtons'
import { MediaButtons } from './toolbar/MediaButtons'
import { HistoryButtons } from './toolbar/HistoryButtons'
import type { RevisionState } from '@/lib/editor/types'

interface EditorToolbarProps {
  editor?: Editor | null
  // For markdown mode
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
  // Mode toggle
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
  // Revision history
  postSlug?: string
  revisions?: RevisionState
  // AI generation state (disables all toolbar buttons during generation)
  aiGenerating?: boolean
  // Comments
  hasSelection?: boolean
  selectionHasComment?: boolean
  onAddComment?: () => void
  commentsCount?: number
  onViewComments?: () => void
  // Loading state
  loading?: boolean
}

export function EditorToolbar({
  editor,
  textareaRef,
  markdown,
  onMarkdownChange,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  aiGenerating,
  hasSelection,
  selectionHasComment,
  onAddComment,
  commentsCount,
  onViewComments,
  loading = false,
}: EditorToolbarProps) {
  // Skeleton state - each button group renders its own skeletons
  if (loading) {
    return (
      <div className="sticky top-0 z-10 flex items-center justify-start md:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto">
        <FormatButtons loading={true} />
        <Divider />
        <BlockButtons loading={true} />
        <Divider />
        <MediaButtons loading={true} />
        <Divider />
        <HistoryButtons loading={true} />
        {/* Comment buttons skeleton */}
        <Divider />
        <SkeletonButton />
        <SkeletonButton />
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-start md:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto">
      <FormatButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
      />

      <Divider />

      <BlockButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
      />

      <Divider />

      <MediaButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
      />

      <Divider />

      <HistoryButtons
        editor={editor}
        textareaRef={textareaRef}
        showMarkdown={showMarkdown}
        setShowMarkdown={setShowMarkdown}
        postSlug={postSlug}
        revisions={revisions}
        aiGenerating={aiGenerating}
      />

      {onViewComments && (
        <>
          <Divider />
          <ToolbarButton
            onClick={onAddComment ?? (() => {})}
            disabled={aiGenerating || !hasSelection || !onAddComment}
            title={
              hasSelection 
                ? 'New comment (⌘⌥M)' 
                : selectionHasComment 
                  ? 'Text already has a comment' 
                  : 'Select text to comment'
            }
          >
            <MessageSquarePlus className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={onViewComments}
            disabled={aiGenerating}
            title="View all comments"
          >
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {commentsCount !== undefined && commentsCount > 0 && (
                <span className="text-xs tabular-nums">{commentsCount}</span>
              )}
            </span>
          </ToolbarButton>
        </>
      )}
    </div>
  )
}
