'use client'

import { useRouter } from 'next/navigation'
import { useKeyboard } from '@/lib/keyboard'
import { SHORTCUTS } from '@/lib/shortcuts'

interface Props {
  prevSlug: string | null
  nextSlug: string | null
  slug: string
}

export function KeyboardNav({ prevSlug, nextSlug, slug }: Props) {
  const router = useRouter()

  useKeyboard([
    { ...SHORTCUTS.TOGGLE_VIEW, handler: () => router.push(`/writer/editor/${slug}`) },
    { ...SHORTCUTS.PREV, handler: () => { if (prevSlug) router.push(`/e/${prevSlug}`) } },
    { ...SHORTCUTS.NEXT, handler: () => { if (nextSlug) router.push(`/e/${nextSlug}`) } },
  ])

  return null
}
