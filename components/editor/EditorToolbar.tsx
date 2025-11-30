'use client'

import { useRef, useCallback, RefObject } from 'react'
import { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils/cn'
import {
  insertAtCursor,
  insertBlockAtCursor,
  setHeadingAtCursor,
  clearMarkdownFormatting,
} from '@/lib/editor/markdown-helpers'
import {
  BulletListIcon,
  NumberedListIcon,
  BlockquoteIcon,
  CodeBlockIcon,
  HorizontalRuleIcon,
  LinkIcon,
  ImageIcon,
  ClearFormattingIcon,
  UndoIcon,
  RedoIcon,
} from '@/components/Icons'

interface EditorToolbarProps {
  editor: Editor | null
  // For markdown mode
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
  // Mode toggle
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, active, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'px-2.5 py-1.5 text-sm font-medium rounded transition-colors',
        'flex items-center justify-center',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
        !active && 'text-gray-600 dark:text-gray-400'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
}

export function EditorToolbar({ editor, textareaRef, markdown, onMarkdownChange, showMarkdown, setShowMarkdown }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

  // Wrap markdown operations to insert syntax
  const wrapSelection = useCallback((before: string, after: string) => {
    if (editor) return
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange)
    }
  }, [editor, textareaRef, markdown, onMarkdownChange])

  const insertBlock = useCallback((prefix: string) => {
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertBlockAtCursor(textareaRef.current, prefix, markdown, onMarkdownChange)
    }
  }, [textareaRef, markdown, onMarkdownChange])

  const setHeading = useCallback((level: number) => {
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      setHeadingAtCursor(textareaRef.current, level, markdown, onMarkdownChange)
    }
  }, [textareaRef, markdown, onMarkdownChange])

  const handleLinkClick = useCallback(() => {
    if (editor) {
      if (editor.isActive('link')) {
        editor.chain().focus().unsetLink().run()
        return
      }
      const url = window.prompt('Enter URL:')
      if (url) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    } else if (isMarkdownMode) {
      const url = window.prompt('Enter URL:')
      if (url && textareaRef?.current) {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = markdown!.substring(start, end) || 'link text'
        const newText = markdown!.substring(0, start) + `[${selected}](${url})` + markdown!.substring(end)
        onMarkdownChange!(newText)
        requestAnimationFrame(() => textarea.focus())
      }
    }
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const { url } = await res.json()
      if (url) {
        if (editor) {
          editor.chain().focus().setImage({ src: url }).run()
        } else if (isMarkdownMode && textareaRef?.current) {
          const textarea = textareaRef.current
          const start = textarea.selectionStart
          const newText = markdown!.substring(0, start) + `![image](${url})` + markdown!.substring(start)
          onMarkdownChange!(newText)
          requestAnimationFrame(() => textarea.focus())
        }
      }
    } catch {
      alert('Failed to upload image')
    }

    e.target.value = ''
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange])

  const handleClearFormatting = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetAllMarks().clearNodes().run()
    } else if (isMarkdownMode && textareaRef?.current && markdown && onMarkdownChange) {
      clearMarkdownFormatting(textareaRef.current, markdown, onMarkdownChange)
    }
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange])

  const handleHorizontalRule = useCallback(() => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    } else if (isMarkdownMode && textareaRef?.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const newText = markdown!.substring(0, start) + '\n---\n' + markdown!.substring(start)
      onMarkdownChange!(newText)
      requestAnimationFrame(() => textarea.focus())
    }
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange])

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

  // Don't render if we have neither editor nor markdown mode
  if (!editor && !isMarkdownMode) return null

  return (
    <div className="flex items-center justify-start md:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto">
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

      <Divider />

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

      <Divider />

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

      <Divider />

      {/* Link and Image */}
      <ToolbarButton
        onClick={handleLinkClick}
        active={editor?.isActive('link')}
        title="Insert link"
      >
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert image">
        <ImageIcon />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Clear formatting */}
      <ToolbarButton onClick={handleClearFormatting} title="Clear formatting">
        <ClearFormattingIcon />
      </ToolbarButton>

      <Divider />

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
    </div>
  )
}
