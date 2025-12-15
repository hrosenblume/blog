'use client'

import { TapLink } from '@/components/TapLink'
import { EmailLink } from '@/components/EmailLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HOMEPAGE } from '@/lib/homepage'

const linkClass = 'underline transition-colors hover:text-gray-900 dark:hover:text-white'

type HomepageFooterProps = {
  contactEmail?: string | null
}

export function HomepageFooter({ contactEmail }: HomepageFooterProps) {
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
        <ThemeToggle />
      </div>
    </footer>
  )
}

