'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ToolbarButton, Divider } from './ToolbarButton'
import { setHeadingAtCursor, insertAtCursor } from '@/lib/editor/markdown-helpers'
import { WandIcon } from '@/components/Icons'

interface FormatButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
  aiGenerating?: boolean
}

export function FormatButtons({ editor, textareaRef, markdown, onMarkdownChange, aiGenerating }: FormatButtonsProps) {
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange
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
      toast.error(err instanceof Error ? err.message : 'Failed to rewrite text')
    } finally {
      setIsRewriting(false)
    }
  }, [editor, isRewriting])

  const setHeading = (level: number) => {
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      setHeadingAtCursor(textareaRef.current, level, markdown, onMarkdownChange)
    }
  }

  const wrapSelection = (before: string, after: string) => {
    if (editor) return
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange)
    }
  }

  return (
    <>
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 1 }).run() : setHeading(1)}
        active={editor?.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 2 }).run() : setHeading(2)}
        active={editor?.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 3 }).run() : setHeading(3)}
        active={editor?.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBold().run() : wrapSelection('**', '**')}
        active={editor?.isActive('bold')}
        title="Bold (⌘B)"
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleItalic().run() : wrapSelection('*', '*')}
        active={editor?.isActive('italic')}
        title="Italic (⌘I)"
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleStrike().run() : wrapSelection('~~', '~~')}
        active={editor?.isActive('strike')}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      {/* AI Rewrite (only in rich text mode with selection) */}
      {editor && (
        <>
          <Divider />
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
        </>
      )}
    </>
  )
}



