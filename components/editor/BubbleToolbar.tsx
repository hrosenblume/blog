'use client'

// BubbleMenu placeholder for future implementation
// The bubble menu requires additional setup with @floating-ui
// For now, we're using the fixed toolbar on all screen sizes

import { Editor } from '@tiptap/react'

interface BubbleToolbarProps {
  editor: Editor | null
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  // Bubble menu will be implemented in a future update
  // For now, the fixed MenuBar handles all screen sizes
  return null
}
