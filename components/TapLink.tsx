'use client'

import { useRef, ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type TapLinkProps = ComponentProps<typeof Link> & {
  href: string
}

/**
 * A Link component that handles tap vs scroll detection for iOS Safari.
 * Navigates only if finger moved < 10px (tap), ignores if scrolling.
 * Works with both internal routes (Next.js navigation) and external URLs.
 */
export function TapLink({ href, children, ...props }: TapLinkProps) {
  const router = useRouter()
  const touchStartY = useRef(0)

  const isExternal = typeof href === 'string' && 
    (href.startsWith('http') || href.startsWith('mailto:'))

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const moved = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (moved < 10) {
      e.preventDefault() // Prevent native link from also firing
      if (isExternal) {
        window.location.href = href
      } else {
        router.push(href)
      }
    }
  }

  if (isExternal) {
    return (
      <a
        href={href}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </Link>
  )
}

