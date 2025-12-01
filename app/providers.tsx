'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

function ThemeShortcut() {
  const { theme, setTheme } = useTheme()

  useKeyboard([
    { ...SHORTCUTS.THEME_TOGGLE, handler: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
  ])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Commented out: Next.js App Router handles scroll-to-top on navigation by default
  // const pathname = usePathname()
  // useEffect(() => {
  //   window.scrollTo(0, 0)
  // }, [pathname])

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeShortcut />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
