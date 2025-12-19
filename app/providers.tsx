'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

function GlobalShortcuts() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useKeyboard([
    { ...SHORTCUTS.THEME_TOGGLE, handler: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { 
      ...SHORTCUTS.ADMIN, 
      handler: () => {
        // Always open admin in a new window (unless already there)
        if (!pathname?.startsWith('/admin')) {
          window.open('/admin', '_blank')
        }
      } 
    },
  ])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <GlobalShortcuts />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
