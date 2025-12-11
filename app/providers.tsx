'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

function GlobalShortcuts() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useKeyboard([
    { ...SHORTCUTS.THEME_TOGGLE, handler: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { 
      ...SHORTCUTS.ADMIN, 
      handler: () => {
        if (pathname?.startsWith('/admin')) {
          // Leaving admin: go back to where we came from
          const returnPath = localStorage.getItem('preAdminPath') ?? '/'
          router.push(returnPath)
        } else {
          // Entering admin: remember where we are
          localStorage.setItem('preAdminPath', pathname ?? '/')
          router.push('/admin')
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
