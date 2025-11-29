'use client'

import { TapLink } from '@/components/TapLink'
import { EmailLink } from '@/components/EmailLink'

export function HomepageFooter() {
  return (
    <footer className="mt-16">
      <nav className="flex gap-6 text-gray-600 dark:text-gray-400" aria-label="Social links">
        <TapLink 
          href="https://x.com/hrosenblume" 
          className="underline transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          Twitter
        </TapLink>
        <TapLink 
          href="https://www.linkedin.com/in/hrosenblume/" 
          className="underline transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          LinkedIn
        </TapLink>
        <EmailLink className="underline transition-colors hover:text-gray-900 dark:hover:text-white" />
      </nav>
    </footer>
  )
}

