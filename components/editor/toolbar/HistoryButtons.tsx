'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { Loader2 } from 'lucide-react'
import { ToolbarButton, Divider } from './ToolbarButton'
import { RevisionHistoryDropdown } from '../RevisionHistoryDropdown'
import { UndoIcon, RedoIcon, SparklesIcon, WandIcon } from '@/components/Icons'
import type { RevisionState } from '@/lib/editor/types'

interface HistoryButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
  postSlug?: string
  revisions?: RevisionState
  onOpenGenerate?: () => void
  aiGenerating?: boolean
}

export function HistoryButtons({
  editor,
  textareaRef,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  onOpenGenerate,
  aiGenerating,
}: HistoryButtonsProps) {
  const [hasSelection, setHasSelection] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)

  // Track text selection in the editor
  useEffect(() => {
    if (!editor) {
      setHasSelection(false)
      return
    }

    const updateSelection = () => {
      const { from, to } = editor.state.selection
      setHasSelection(from !== to)
    }

    editor.on('selectionUpdate', updateSelection)
    editor.on('transaction', updateSelection)
    
    return () => {
      editor.off('selectionUpdate', updateSelection)
      editor.off('transaction', updateSelection)
    }
  }, [editor])

  // Handle rewrite selected text
  const handleRewrite = useCallback(async () => {
    if (!editor || isRewriting) return
    
    const { from, to } = editor.state.selection
    if (from === to) return

    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    if (!selectedText.trim()) return

    setIsRewriting(true)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Rewrite failed')
      }

      const result = await res.json()
      
      // Replace the selected text with the rewritten version
      editor.chain().focus().deleteSelection().insertContent(result.text).run()
    } catch (err) {
      console.error('Rewrite error:', err)
      alert(err instanceof Error ? err.message : 'Failed to rewrite text')
    } finally {
      setIsRewriting(false)
    }
  }, [editor, isRewriting])

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

      {/* AI Generate */}
      {onOpenGenerate && (
        <>
          <Divider />
          <ToolbarButton
            onClick={onOpenGenerate}
            disabled={aiGenerating}
            title="Generate with AI"
          >
            <SparklesIcon />
          </ToolbarButton>
        </>
      )}

      {/* AI Rewrite (only in rich text mode with selection) */}
      {editor && (
        <ToolbarButton
          onClick={handleRewrite}
          disabled={!hasSelection || isRewriting || aiGenerating}
          title={hasSelection ? 'Rewrite selection with AI' : 'Select text to rewrite'}
        >
          {isRewriting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <WandIcon />
          )}
        </ToolbarButton>
      )}
    </>
  )
}
