'use client'

import { useEffect, useRef } from 'react'

interface Shortcut {
  key: string
  meta?: boolean
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

      for (const shortcut of shortcutsRef.current) {
        if (!shortcut.allowInInput && isTyping) continue

        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key

        if (metaMatch && keyMatch) {
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



