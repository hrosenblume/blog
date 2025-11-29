'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { SHORTCUTS } from '@/lib/shortcuts'

function ThemeShortcut() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const { key, meta } = SHORTCUTS.THEME_TOGGLE
      if ((meta ? e.metaKey : true) && e.key === key) {
        e.preventDefault()
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme, setTheme])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeShortcut />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

