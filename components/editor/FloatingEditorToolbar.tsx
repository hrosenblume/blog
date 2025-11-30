'use client'

// FloatingEditorToolbar placeholder for future implementation
// The bubble menu requires additional setup with @floating-ui
// For now, we're using the fixed toolbar on all screen sizes

import { Editor } from '@tiptap/react'

interface FloatingEditorToolbarProps {
  editor: Editor | null
}

export function FloatingEditorToolbar({ editor }: FloatingEditorToolbarProps) {
  // Floating toolbar will be implemented in a future update
  // For now, the fixed EditorToolbar handles all screen sizes
  return null
}

