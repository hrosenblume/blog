'use client'

import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { ToolbarButton } from './ToolbarButton'
import { insertBlockAtCursor, insertAtCursor } from '@/lib/editor/markdown-helpers'
import {
  BulletListIcon,
  NumberedListIcon,
  BlockquoteIcon,
  CodeBlockIcon,
  HorizontalRuleIcon,
} from '@/components/Icons'

interface BlockButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
}

export function BlockButtons({ editor, textareaRef, markdown, onMarkdownChange }: BlockButtonsProps) {
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

  const insertBlock = (prefix: string) => {
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertBlockAtCursor(textareaRef.current, prefix, markdown, onMarkdownChange)
    }
  }

  const wrapSelection = (before: string, after: string) => {
    if (editor) return
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange)
    }
  }

  const handleHorizontalRule = () => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    } else if (isMarkdownMode && textareaRef?.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const newText = markdown!.substring(0, start) + '\n---\n' + markdown!.substring(start)
      onMarkdownChange!(newText)
      requestAnimationFrame(() => textarea.focus())
    }
  }

  return (
    <>
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBulletList().run() : insertBlock('- ')}
        active={editor?.isActive('bulletList')}
        title="Bullet list"
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleOrderedList().run() : insertBlock('1. ')}
        active={editor?.isActive('orderedList')}
        title="Numbered list"
      >
        <NumberedListIcon />
      </ToolbarButton>

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBlockquote().run() : insertBlock('> ')}
        active={editor?.isActive('blockquote')}
        title="Blockquote"
      >
        <BlockquoteIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleCodeBlock().run() : wrapSelection('```\n', '\n```')}
        active={editor?.isActive('codeBlock')}
        title="Code block"
      >
        <CodeBlockIcon />
      </ToolbarButton>
      <ToolbarButton onClick={handleHorizontalRule} title="Horizontal rule">
        <HorizontalRuleIcon />
      </ToolbarButton>
    </>
  )
}




