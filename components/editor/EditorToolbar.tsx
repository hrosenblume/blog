'use client'

import { useRef, useCallback, RefObject } from 'react'
import { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils/cn'

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

// Helper to insert text at cursor position in textarea
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = markdown.substring(start, end)
  const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end)
  onMarkdownChange(newText)
  
  // Restore focus and selection after React re-render
  requestAnimationFrame(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selected.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

// Helper to insert/toggle block element at cursor (like lists, blockquotes)
function insertBlockAtCursor(
  textarea: HTMLTextAreaElement,
  prefix: string,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Find the start of the current line
  let lineStart = start
  while (lineStart > 0 && markdown[lineStart - 1] !== '\n') {
    lineStart--
  }
  
  // Get current line content
  let lineEnd = end
  while (lineEnd < markdown.length && markdown[lineEnd] !== '\n') {
    lineEnd++
  }
  const lineContent = markdown.substring(lineStart, lineEnd)
  
  // Check if already has prefix, toggle off
  if (lineContent.startsWith(prefix)) {
    const newText = markdown.substring(0, lineStart) + lineContent.substring(prefix.length) + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  } else {
    const newText = markdown.substring(0, lineStart) + prefix + lineContent + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  }
  
  requestAnimationFrame(() => {
    textarea.focus()
  })
}

// Helper for heading levels - replaces any existing heading with the new level
function setHeadingAtCursor(
  textarea: HTMLTextAreaElement,
  level: number,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Find the start of the current line
  let lineStart = start
  while (lineStart > 0 && markdown[lineStart - 1] !== '\n') {
    lineStart--
  }
  
  // Get current line content
  let lineEnd = end
  while (lineEnd < markdown.length && markdown[lineEnd] !== '\n') {
    lineEnd++
  }
  const lineContent = markdown.substring(lineStart, lineEnd)
  
  // Remove any existing heading prefix
  const withoutHeading = lineContent.replace(/^#{1,6}\s*/, '')
  const newPrefix = '#'.repeat(level) + ' '
  
  // If the line already has this exact heading level, toggle it off
  const currentHeadingMatch = lineContent.match(/^(#{1,6})\s/)
  if (currentHeadingMatch && currentHeadingMatch[1].length === level) {
    // Toggle off - remove heading
    const newText = markdown.substring(0, lineStart) + withoutHeading + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  } else {
    // Set new heading level
    const newText = markdown.substring(0, lineStart) + newPrefix + withoutHeading + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  }
  
  requestAnimationFrame(() => {
    textarea.focus()
  })
}

export function EditorToolbar({ editor, textareaRef, markdown, onMarkdownChange, showMarkdown, setShowMarkdown }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

  // Wrap markdown operations to insert syntax
  const wrapSelection = useCallback((before: string, after: string) => {
    if (editor) {
      return
    }
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
        requestAnimationFrame(() => {
          textarea.focus()
        })
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
          requestAnimationFrame(() => {
            textarea.focus()
          })
        }
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload image')
    }

    e.target.value = ''
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange])

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
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="4" cy="6" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="4" cy="18" r="2" />
          <rect x="9" y="5" width="12" height="2" rx="1" />
          <rect x="9" y="11" width="12" height="2" rx="1" />
          <rect x="9" y="17" width="12" height="2" rx="1" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleOrderedList().run() : insertBlock('1. ')}
        active={editor?.isActive('orderedList')}
        title="Numbered list"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <text x="2" y="8" fontSize="6" fontWeight="bold">1</text>
          <text x="2" y="14" fontSize="6" fontWeight="bold">2</text>
          <text x="2" y="20" fontSize="6" fontWeight="bold">3</text>
          <rect x="9" y="5" width="12" height="2" rx="1" />
          <rect x="9" y="11" width="12" height="2" rx="1" />
          <rect x="9" y="17" width="12" height="2" rx="1" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBlockquote().run() : insertBlock('> ')}
        active={editor?.isActive('blockquote')}
        title="Blockquote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleCodeBlock().run() : wrapSelection('```\n', '\n```')}
        active={editor?.isActive('codeBlock')}
        title="Code block"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor) {
            editor.chain().focus().setHorizontalRule().run()
          } else if (isMarkdownMode && textareaRef?.current) {
            const textarea = textareaRef.current
            const start = textarea.selectionStart
            const newText = markdown!.substring(0, start) + '\n---\n' + markdown!.substring(start)
            onMarkdownChange!(newText)
            requestAnimationFrame(() => textarea.focus())
          }
        }}
        title="Horizontal rule"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Link and Image */}
      <ToolbarButton
        onClick={handleLinkClick}
        active={editor?.isActive('link')}
        title="Insert link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Insert image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Clear formatting */}
      <ToolbarButton
        onClick={() => {
          if (editor) {
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          } else if (isMarkdownMode && textareaRef?.current) {
            // Strip common markdown syntax from selection
            const textarea = textareaRef.current
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            if (start !== end) {
              const selected = markdown!.substring(start, end)
              // Remove bold, italic, strikethrough, code, links
              const cleaned = selected
                .replace(/\*\*(.+?)\*\*/g, '$1')  // bold
                .replace(/\*(.+?)\*/g, '$1')      // italic
                .replace(/~~(.+?)~~/g, '$1')      // strikethrough
                .replace(/`(.+?)`/g, '$1')        // inline code
                .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
              const newText = markdown!.substring(0, start) + cleaned + markdown!.substring(end)
              onMarkdownChange!(newText)
              requestAnimationFrame(() => {
                textarea.focus()
                textarea.setSelectionRange(start, start + cleaned.length)
              })
            }
          }
        }}
        title="Clear formatting"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => {
          if (editor) {
            editor.chain().focus().undo().run()
          } else if (textareaRef?.current) {
            textareaRef.current.focus()
            document.execCommand('undo')
          }
        }}
        disabled={editor ? !editor.can().undo() : false}
        title="Undo (⌘Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor) {
            editor.chain().focus().redo().run()
          } else if (textareaRef?.current) {
            textareaRef.current.focus()
            document.execCommand('redo')
          }
        }}
        disabled={editor ? !editor.can().redo() : false}
        title="Redo (⌘⇧Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
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
