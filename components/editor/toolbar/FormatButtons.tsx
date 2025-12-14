'use client'

import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { ToolbarButton, Divider } from './ToolbarButton'
import { setHeadingAtCursor, insertAtCursor } from '@/lib/editor/markdown-helpers'

interface FormatButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
}

export function FormatButtons({ editor, textareaRef, markdown, onMarkdownChange }: FormatButtonsProps) {
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

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
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleCode().run() : wrapSelection('`', '`')}
        active={editor?.isActive('code')}
        title="Inline code"
      >
        <span className="font-mono text-xs">&lt;/&gt;</span>
      </ToolbarButton>
    </>
  )
}

