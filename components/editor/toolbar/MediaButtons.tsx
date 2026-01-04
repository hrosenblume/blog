'use client'

import { useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { toast } from 'sonner'
import { ToolbarButton } from './ToolbarButton'
import { clearMarkdownFormatting } from '@/lib/editor/markdown-helpers'
import { LinkIcon, ImageIcon, ClearFormattingIcon } from '@/components/Icons'

interface MediaButtonsProps {
  editor: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
}

export function MediaButtons({ editor, textareaRef, markdown, onMarkdownChange }: MediaButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

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

    // Client-side validation
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      toast.error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 4MB.`)
      e.target.value = ''
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.type}. Supported types: JPEG, PNG, GIF, WebP.`)
      e.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload image')
        e.target.value = ''
        return
      }

      if (data.url) {
        if (editor) {
          editor.chain().focus().setImage({ src: data.url }).run()
        } else if (isMarkdownMode && textareaRef?.current) {
          const textarea = textareaRef.current
          const start = textarea.selectionStart
          const newText = markdown!.substring(0, start) + `![image](${data.url})` + markdown!.substring(start)
          onMarkdownChange!(newText)
          requestAnimationFrame(() => textarea.focus())
        }
      } else {
        toast.error('Upload succeeded but no URL returned')
      }
    } catch (err) {
      toast.error('Failed to upload image. Please try again.')
      console.error('Image upload error:', err)
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

  return (
    <>
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
      <ToolbarButton onClick={handleClearFormatting} title="Clear formatting">
        <ClearFormattingIcon />
      </ToolbarButton>
    </>
  )
}





