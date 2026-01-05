'use client'

import { useRef } from 'react'
import type { StashedContent } from './types'

/**
 * Hook for stashing and restoring content during preview modes.
 * Used by both revision preview and AI generation to preserve original content.
 * 
 * Only one preview mode can be active at a time (intentional design).
 */
export function useContentStash() {
  const stash = useRef<StashedContent | null>(null)
  
  return {
    /** Save current content before entering preview mode */
    save: (content: StashedContent) => { 
      stash.current = content 
    },
    
    /** Restore stashed content and clear the stash */
    restore: () => { 
      const s = stash.current
      stash.current = null
      return s 
    },
    
    /** Clear stash without restoring (e.g., when accepting changes) */
    clear: () => { 
      stash.current = null 
    },
    
    /** Get current stashed content (read-only) */
    get current() { 
      return stash.current 
    },
  }
}
