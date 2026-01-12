'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TapLink } from '@/components/TapLink'
import { EmailLink } from '@/components/EmailLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CogIcon } from '@/components/Icons'
import { HOMEPAGE } from '@/lib/homepage'

const linkClass = 'underline transition-colors hover:text-gray-900 dark:hover:text-white'

type HomepageFooterProps = {
  contactEmail?: string | null
}

export function HomepageFooter({ contactEmail }: HomepageFooterProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  return (
    <footer className="mt-16">
      <div className="flex items-center justify-between">
        <nav className="flex gap-6 text-gray-600 dark:text-gray-400" aria-label="Social links">
          {HOMEPAGE.footerLinks.map((link, index) =>
            link.type === 'email' ? (
              <EmailLink key={index} className={linkClass} email={contactEmail} />
            ) : (
              <TapLink key={index} href={link.href!} className={linkClass}>
                {link.label}
              </TapLink>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/settings"
              className="w-9 h-9 rounded-md border border-border interactive-bg-accent text-muted-foreground flex items-center justify-center"
              aria-label="Site settings"
              title="Site settings"
            >
              <CogIcon />
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}

