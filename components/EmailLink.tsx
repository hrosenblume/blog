'use client'

import { TapLink } from '@/components/TapLink'
import { HOMEPAGE } from '@/lib/homepage'

type EmailLinkProps = {
  className?: string
  email?: string | null
}

export function EmailLink({ className, email }: EmailLinkProps) {
  const emailAddress = email || HOMEPAGE.email
  if (!emailAddress) return null

  return (
    <TapLink href={`mailto:${emailAddress}`} className={className}>
      Email
    </TapLink>
  )
}
