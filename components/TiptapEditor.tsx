'use client'

import { useEffect, useMemo } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { marked } from 'marked'
import { htmlToMarkdown } from '@/lib/turndown'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { FloatingEditorToolbar } from '@/components/editor/FloatingEditorToolbar'

// Client-safe markdown to HTML (no sanitize-html - Tiptap handles sanitization)
function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { gfm: true, breaks: true }) as string
}

interface TiptapEditorProps {
  content: string // markdown
  onChange: (markdown: string) => void
  placeholder?: string
  onEditorReady?: (editor: Editor) => void
}

export function TiptapEditor({ content, onChange, placeholder = 'Write your story...', onEditorReady }: TiptapEditorProps) {
  // Convert initial content to HTML once
  const initialHtml = useMemo(() => content ? markdownToHtml(content) : '', [content])

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions: [
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
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-900 prose-p:dark:text-white prose-p:leading-relaxed prose-a:text-gray-900 prose-a:dark:text-white prose-a:underline prose-strong:text-gray-900 prose-strong:dark:text-white prose-code:text-gray-900 prose-code:dark:text-white prose-blockquote:border-gray-300 prose-blockquote:dark:border-gray-700 prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400 min-h-[500px] outline-none',
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

  return (
    <>
      <FloatingEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}

// Export EditorToolbar separately so it can be rendered in different position
export { EditorToolbar } from '@/components/editor/EditorToolbar'
