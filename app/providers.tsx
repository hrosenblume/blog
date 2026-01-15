'use client'

import { useRef } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useKeyboard } from 'autoblogger/ui'

function GlobalShortcuts() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const previousPathRef = useRef<string>('/')

  useKeyboard([
    { 
      key: '.', 
      metaKey: true, 
      allowInInput: true, 
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark') 
    },
    {
      key: ';',
      metaKey: true,
      allowInInput: true,
      action: () => {
        if (pathname?.startsWith('/settings')) {
          // Go back to previous page
          router.push(previousPathRef.current)
        } else {
          // Save current path and go to settings
          previousPathRef.current = pathname || '/'
          router.push('/settings')
        }
      },
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
