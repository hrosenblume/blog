'use client'

import { useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

const WRITER_PATH = '/writer'
const TAP_COUNT = 3
const TAP_WINDOW_MS = 2000

const getWriterPath = () => 
  typeof window === 'undefined' ? WRITER_PATH : localStorage.getItem('lastWriterPath') ?? WRITER_PATH

export function SecretNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const tapTimestamps = useRef<number[]>([])

  // Cmd+/ to navigate to writer
  useKeyboard([
    { ...SHORTCUTS.TOGGLE_VIEW, handler: () => router.push(getWriterPath()) },
  ])

  const handleTap = useCallback(() => {
    const now = Date.now()
    tapTimestamps.current = [...tapTimestamps.current.filter(t => now - t < TAP_WINDOW_MS), now]
    if (tapTimestamps.current.length >= TAP_COUNT) {
      tapTimestamps.current = []
      router.push(getWriterPath())
    }
  }, [router])

  return (
    <span onClick={handleTap} className="cursor-default select-none">
      {children}
    </span>
  )
}

