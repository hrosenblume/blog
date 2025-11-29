'use client'

import { TapLink } from '@/components/TapLink'
import { HOMEPAGE } from '@/lib/homepage'

export function EmailLink({ className }: { className?: string }) {
  return (
    <TapLink href={`mailto:${HOMEPAGE.email}`} className={className}>
      Email
    </TapLink>
  )
}
