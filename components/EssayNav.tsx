'use client'

import { TapLink } from '@/components/TapLink'
import { cn } from '@/lib/utils/cn'

interface EssayNavProps {
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  isFirst?: boolean  // At first essay, "Previous" wraps to last
  isLast?: boolean   // At last essay, "Next" wraps to first
}

const navLinkClass = 'flex-1 flex flex-col justify-center px-6 overflow-hidden transition-colors text-muted-foreground can-hover:hover:bg-accent can-hover:hover:text-foreground active:bg-accent/80'

export function EssayNav({ prev, next, isFirst = false, isLast = false }: EssayNavProps) {
  if (!prev && !next) return null

  const hasBoth = prev && next

  return (
    <nav className="mt-16 -mx-6 border-y border-border">
      <div className="flex h-36">
        {prev && (
          <TapLink href={`/e/${prev.slug}`} className={navLinkClass}>
            <span className="text-xs uppercase tracking-wide mb-1">
              {isFirst ? '« Last Essay' : '« Previous'}
            </span>
            <span className="font-medium text-foreground line-clamp-3">{prev.title}</span>
          </TapLink>
        )}

        {hasBoth && <div className="w-px bg-border" />}

        {next && (
          <TapLink
            href={`/e/${next.slug}`}
            className={cn(navLinkClass, hasBoth && 'items-end text-right')}
          >
            <span className="text-xs uppercase tracking-wide mb-1">
              {isLast ? 'First Essay »' : 'Next »'}
            </span>
            <span className="font-medium text-foreground line-clamp-3">{next.title}</span>
          </TapLink>
        )}
      </div>
    </nav>
  )
}
