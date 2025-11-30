import Link from 'next/link'

interface BackLinkProps {
  href: string
  label?: string
}

/**
 * A consistent "← Back" link used across pages.
 * Provides the same styling and touch target size.
 */
export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center min-h-[44px] px-3 py-2 -mx-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors mb-4"
    >
      ← {label}
    </Link>
  )
}

