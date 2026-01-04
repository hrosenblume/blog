'use client'

import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { ToolbarButton, Divider } from './ToolbarButton'
import { RevisionHistoryDropdown } from '../RevisionHistoryDropdown'
import { UndoIcon, RedoIcon } from '@/components/Icons'
import type { RevisionState } from '@/lib/editor/types'

interface HistoryButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
  postSlug?: string
  revisions?: RevisionState
}

export function HistoryButtons({
  editor,
  textareaRef,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
}: HistoryButtonsProps) {
  const handleUndo = useCallback(() => {
    if (editor) {
      editor.chain().focus().undo().run()
    } else if (textareaRef?.current) {
      textareaRef.current.focus()
      document.execCommand('undo')
    }
  }, [editor, textareaRef])

  const handleRedo = useCallback(() => {
    if (editor) {
      editor.chain().focus().redo().run()
    } else if (textareaRef?.current) {
      textareaRef.current.focus()
      document.execCommand('redo')
    }
  }, [editor, textareaRef])

  return (
    <>
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={handleUndo}
        disabled={editor ? !editor.can().undo() : false}
        title="Undo (⌘Z)"
      >
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={handleRedo}
        disabled={editor ? !editor.can().redo() : false}
        title="Redo (⌘⇧Z)"
      >
        <RedoIcon />
      </ToolbarButton>

      {/* Markdown/Rich Text mode toggle */}
      {setShowMarkdown && (
        <>
          <Divider />
          <ToolbarButton
            onClick={() => setShowMarkdown(!showMarkdown)}
            active={showMarkdown}
            title={showMarkdown ? 'Switch to rich text editor' : 'Switch to markdown mode'}
          >
            <span className="font-mono text-xs">MD</span>
          </ToolbarButton>
        </>
      )}

      {/* Revision History */}
      {revisions && (
        <>
          <Divider />
          <RevisionHistoryDropdown
            revisions={revisions.list}
            loading={revisions.loading}
            previewLoading={revisions.previewLoading}
            disabled={!postSlug}
            isPreviewMode={!!revisions.previewing}
            onOpen={revisions.fetch}
            onSelect={revisions.preview}
          />
        </>
      )}
    </>
  )
}




