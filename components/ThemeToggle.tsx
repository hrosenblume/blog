'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { SunIcon, MoonIcon } from '@/components/Icons'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'w-9 h-9 rounded-md border border-border',
        'hover:bg-accent',
        'text-muted-foreground',
        'flex items-center justify-center',
        className
      )}
      aria-label="Toggle dark mode"
    >
      {!mounted ? (
        <div className="w-4 h-4" />
      ) : theme === 'dark' ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </button>
  )
}
