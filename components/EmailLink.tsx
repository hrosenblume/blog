'use client'

import { TapLink } from '@/components/TapLink'

export function EmailLink({ className }: { className?: string }) {
  return (
    <TapLink href="mailto:your-email@example.com" className={className}>
      Email
    </TapLink>
  )
}
