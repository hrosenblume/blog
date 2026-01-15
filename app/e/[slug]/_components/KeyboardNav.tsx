'use client'

import { useRouter } from 'next/navigation'
import { useKeyboard } from 'autoblogger/ui'

interface Props {
  prevSlug: string | null
  nextSlug: string | null
  slug: string
}

export function KeyboardNav({ prevSlug, nextSlug, slug }: Props) {
  const router = useRouter()

  useKeyboard([
    { 
      key: '/', 
      metaKey: true, 
      allowInInput: true, 
      action: () => router.push(`/writer/editor/${slug}`) 
    },
    { 
      key: 'ArrowLeft', 
      action: () => { if (prevSlug) router.push(`/e/${prevSlug}`) } 
    },
    { 
      key: 'ArrowRight', 
      action: () => { if (nextSlug) router.push(`/e/${nextSlug}`) } 
    },
  ])

  return null
}
