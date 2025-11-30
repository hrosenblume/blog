'use client'

import { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils/cn'

interface MenuBarProps {
  editor: Editor | null
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

export function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto">
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (⌘B)"
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (⌘I)"
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline code"
      >
        <span className="font-mono text-xs">&lt;/&gt;</span>
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
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
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
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
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code block"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </ToolbarButton>
    </div>
  )
}

