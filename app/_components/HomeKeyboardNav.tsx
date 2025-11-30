'use client'

import { useRouter } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

export function HomeKeyboardNav() {
  const router = useRouter()

  useKeyboard([
    { ...SHORTCUTS.TOGGLE_VIEW, handler: () => router.push('/writer') },
  ])

  return null
}



