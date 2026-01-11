'use client'

import { useEffect } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * Focus the editor and insert the typed character when user starts typing
 * with nothing focused on the page.
 * 
 * @param editor - Tiptap editor instance
 * @param enabled - Whether the hook is active (false during loading/generating)
 */
export function useTypeToFocus(editor: Editor | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if something is already focused (input, textarea, contenteditable)
      const active = document.activeElement
      if (active && active !== document.body) {
        const tagName = active.tagName.toLowerCase()
        if (tagName === 'input' || tagName === 'textarea' || (active as HTMLElement).isContentEditable) {
          return
        }
      }
      
      // Skip if modifier keys (except Shift for capitals)
      if (e.metaKey || e.ctrlKey || e.altKey) return
      
      // Skip non-printable keys
      if (e.key.length !== 1) return
      
      // Prevent default so the character isn't typed elsewhere
      e.preventDefault()
      
      // Focus the editor and insert the typed character
      editor.commands.focus('end')
      editor.commands.insertContent(e.key)
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, enabled])
}
