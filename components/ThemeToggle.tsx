'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface ThemeToggleProps {
  size?: 'sm' | 'md'
  className?: string
}

export function ThemeToggle({ size = 'sm', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render theme-dependent content after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2.5',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        sizeClasses[size],
        'rounded-md border border-gray-300 dark:border-gray-700',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'text-gray-600 dark:text-gray-400',
        className
      )}
      aria-label="Toggle dark mode"
    >
      {/* Render placeholder until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <div className={iconSizes[size]} />
      ) : theme === 'dark' ? (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
