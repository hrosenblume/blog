'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

function GlobalShortcuts() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  useKeyboard([
    { ...SHORTCUTS.THEME_TOGGLE, handler: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { 
      ...SHORTCUTS.ADMIN, 
      handler: () => {
        // Toggle to/from settings
        if (pathname?.startsWith('/settings')) {
          router.back()  // Go back to where you came from
        } else {
          router.push('/settings')
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
