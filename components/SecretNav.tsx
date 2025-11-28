'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const WRITER_PATH = '/writer'
const TAP_COUNT = 5
const TAP_WINDOW_MS = 2000
const LAST_PATH_KEY = 'lastWriterPath'

function getWriterPath(): string {
  if (typeof window === 'undefined') return WRITER_PATH
  return localStorage.getItem(LAST_PATH_KEY) || WRITER_PATH
}

function navigateToWriter(router: ReturnType<typeof useRouter>) {
  router.push(getWriterPath())
}

export function SecretNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const tapTimestamps = useRef<number[]>([])

  // Cmd + / keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === '/') {
        e.preventDefault()
        navigateToWriter(router)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // Multi-tap detection
  const handleTap = useCallback(() => {
    const now = Date.now()
    tapTimestamps.current.push(now)
    
    // Keep only taps within the window
    tapTimestamps.current = tapTimestamps.current.filter(
      t => now - t < TAP_WINDOW_MS
    )
    
    if (tapTimestamps.current.length >= TAP_COUNT) {
      tapTimestamps.current = []
      navigateToWriter(router)
    }
  }, [router])

  return (
    <span onClick={handleTap} className="cursor-default select-none">
      {children}
    </span>
  )
}

