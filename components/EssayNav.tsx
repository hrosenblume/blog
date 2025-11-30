'use client'

import { TapLink } from '@/components/TapLink'
import { navLinkClass } from '@/lib/styles'
import { cn } from '@/lib/utils/cn'

interface EssayNavProps {
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export function EssayNav({ prev, next }: EssayNavProps) {
  if (!prev && !next) return null

  const hasBoth = prev && next

  return (
    <nav className="mt-16 -mx-6 border-y border-gray-200 dark:border-gray-800">
      <div className="flex h-36">
        {prev && (
          <TapLink href={`/e/${prev.slug}`} className={navLinkClass}>
            <span className="text-xs uppercase tracking-wide mb-1">« Last</span>
            <span className="font-medium text-gray-900 dark:text-white line-clamp-3">{prev.title}</span>
          </TapLink>
        )}

        {hasBoth && <div className="w-px bg-gray-200 dark:bg-gray-800" />}

        {next && (
          <TapLink
            href={`/e/${next.slug}`}
            className={cn(navLinkClass, hasBoth && 'items-end text-right')}
          >
            <span className="text-xs uppercase tracking-wide mb-1">Next »</span>
            <span className="font-medium text-gray-900 dark:text-white line-clamp-3">{next.title}</span>
          </TapLink>
        )}
      </div>
    </nav>
  )
}
