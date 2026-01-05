'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { markdownToHtml } from '@/lib/markdown'
import { htmlToMarkdown } from '@/lib/turndown'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { PROSE_CLASSES } from '@/components/ArticleBody'
import { CommentMark } from '@/lib/editor/comment-mark'

export interface SelectionState {
  hasSelection: boolean
  text: string
  from: number
  to: number
  hasExistingComment: boolean
}

interface TiptapEditorProps {
  content: string // markdown
  onChange: (markdown: string) => void
  placeholder?: string
  onEditorReady?: (editor: Editor) => void
  onSelectionChange?: (selection: SelectionState | null) => void
  onCommentClick?: (commentId: string) => void
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Write your story...', 
  onEditorReady,
  onSelectionChange,
  onCommentClick,
}: TiptapEditorProps) {
  // Convert initial content to HTML once
  const initialHtml = useMemo(() => content ? markdownToHtml(content) : '', [content])

  // Memoize extensions to include comment click handler
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 dark:text-blue-400 underline',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full',
      },
    }),
    CommentMark.configure({
      onCommentClick,
    }),
  ], [placeholder, onCommentClick])

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions,
    content: initialHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange(markdown)
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onSelectionChange) return
      
      const { from, to, empty } = editor.state.selection
      if (empty) {
        onSelectionChange(null)
      } else {
        const text = editor.state.doc.textBetween(from, to, ' ')
        
        // Check if selection contains any comment marks
        let hasExistingComment = false
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (node.marks.some(mark => mark.type.name === 'comment')) {
            hasExistingComment = true
            return false // stop iteration
          }
        })
        
        onSelectionChange({
          hasSelection: true,
          text,
          from,
          to,
          hasExistingComment,
        })
      }
    },
    editorProps: {
      attributes: {
        // Use shared prose classes + editor-specific additions
        class: `${PROSE_CLASSES} min-h-[500px] outline-none`,
      },
    },
  })

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  // Sync external content changes (e.g., loading saved post)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML())
      // Only update if content is actually different to avoid cursor jumping
      if (currentMarkdown !== content) {
        const html = content ? markdownToHtml(content) : ''
        editor.commands.setContent(html, { emitUpdate: false })
      }
    }
  }, [editor, content])

  return <EditorContent editor={editor} />
}

// Export EditorToolbar separately so it can be rendered in different position
export { EditorToolbar } from '@/components/editor/EditorToolbar'
