'use client'

import { useRef } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useKeyboard } from 'autoblogger/ui'

function GlobalShortcuts() {
  const pathname = usePathname()
  const router = useRouter()
  const previousPathRef = useRef<string>('/')

  useKeyboard([
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
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <GlobalShortcuts />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
