'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const WRITER_PATH = '/writer'
const TAP_COUNT = 5
const TAP_WINDOW_MS = 2000

const getWriterPath = () => 
  typeof window === 'undefined' ? WRITER_PATH : localStorage.getItem('lastWriterPath') ?? WRITER_PATH

export function SecretNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const tapTimestamps = useRef<number[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '/') {
        e.preventDefault()
        router.push(getWriterPath())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

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

