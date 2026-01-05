'use client'

import { useEffect } from 'react'

/**
 * Syncs theme-color meta tags with the actual DOM class.
 * Replaces media-query based tags with a single explicit one on user toggle.
 */
export function ThemeColorMeta() {
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const color = isDark ? '#09090b' : '#ffffff'
      
      // Disable transitions during theme-color update to prevent flash
      document.body.classList.add('no-transitions')
      
      // Remove all existing theme-color meta tags
      document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove())
      
      // Add single theme-color without media query (overrides system preference)
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = color
      document.head.appendChild(meta)
      
      // Re-enable transitions after a frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.remove('no-transitions')
        })
      })
    }

    // Initial sync
    updateThemeColor()

    // Watch for class changes on <html>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          updateThemeColor()
        }
      }
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return null
}
