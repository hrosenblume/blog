'use client'

import { useEffect, useRef } from 'react'

interface Shortcut {
  key: string
  meta?: boolean
  alt?: boolean
  shift?: boolean
  handler: () => void
  allowInInput?: boolean
}

export function useKeyboard(shortcuts: Shortcut[]) {
  // Use ref to avoid effect re-running when shortcuts array reference changes
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.closest('[contenteditable="true"]'))

      // Check if event is inside a dialog/modal - let the modal handle its own Escape
      const targetEl = e.target instanceof HTMLElement ? e.target : null
      const isInDialog = targetEl && (
        targetEl.closest('[role="dialog"]') ||
        targetEl.closest('[role="alertdialog"]') ||
        targetEl.closest('[data-radix-dialog-content]') ||
        targetEl.closest('[data-radix-alert-dialog-content]')
      )

      for (const shortcut of shortcutsRef.current) {
        if (!shortcut.allowInInput && isTyping) continue

        // Skip Escape handling if inside a dialog - let the dialog close first
        if (shortcut.key === 'Escape' && isInDialog) {
          continue
        }

        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        
        // Check both e.key and e.code for matching
        // When Alt/Option is pressed on Mac, the key character changes (e.g., m → µ)
        // So we also check e.code (physical key) for alt-modified shortcuts
        const keyLower = e.key.toLowerCase()
        const codeLower = e.code.toLowerCase()
        const targetKey = shortcut.key.toLowerCase()
        const keyMatch = keyLower === targetKey || 
          (shortcut.alt && codeLower === `key${targetKey}`)

        if (metaMatch && altMatch && shiftMatch && keyMatch) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // Empty deps - only run once, ref keeps handlers fresh
}
