'use client'

import { useEffect } from 'react'

/**
 * iOS Safari doesn't fire :active pseudo-class without a touch event listener.
 * This component adds a passive touchstart listener to enable active states globally.
 */
export function TouchActiveEnabler() {
  useEffect(() => {
    // Empty handler enables :active on iOS Safari
    const noop = () => {}
    document.addEventListener('touchstart', noop, { passive: true })
    return () => document.removeEventListener('touchstart', noop)
  }, [])

  return null
}

