'use client'

import { useRouter } from 'next/navigation'
import { useKeyboard } from '@/lib/keyboard'
import { SHORTCUTS } from '@/lib/shortcuts'

export function HomeKeyboardNav() {
  const router = useRouter()

  useKeyboard([
    { ...SHORTCUTS.TOGGLE_VIEW, handler: () => router.push('/writer') },
  ])

  return null
}

