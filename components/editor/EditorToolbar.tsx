'use client'

import type { RefObject } from 'react'
import type { Editor } from '@tiptap/react'
import { Divider } from './toolbar/ToolbarButton'
import { FormatButtons } from './toolbar/FormatButtons'
import { BlockButtons } from './toolbar/BlockButtons'
import { MediaButtons } from './toolbar/MediaButtons'
import { HistoryButtons } from './toolbar/HistoryButtons'
import type { RevisionState } from '@/lib/editor/types'

interface EditorToolbarProps {
  editor: Editor | null
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
  // AI generation
  onOpenGenerate?: () => void
  aiGenerating?: boolean
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
  onOpenGenerate,
  aiGenerating,
}: EditorToolbarProps) {
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

  // Don't render if we have neither editor nor markdown mode
  if (!editor && !isMarkdownMode) return null

  return (
    <div className="flex items-center justify-start md:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto">
      <FormatButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
      />

      <Divider />

      <BlockButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
      />

      <Divider />

      <MediaButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
      />

      <Divider />

      <HistoryButtons
        editor={editor}
        textareaRef={textareaRef}
        showMarkdown={showMarkdown}
        setShowMarkdown={setShowMarkdown}
        postSlug={postSlug}
        revisions={revisions}
        onOpenGenerate={onOpenGenerate}
        aiGenerating={aiGenerating}
      />
    </div>
  )
}
