'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { SunIcon, MoonIcon } from '@/components/Icons'

interface ThemeToggleProps {
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = { sm: 'p-1.5', md: 'p-2.5' }
const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5' }

export function ThemeToggle({ size = 'sm', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
      {!mounted ? (
        <div className={iconSizes[size]} />
      ) : theme === 'dark' ? (
        <SunIcon className={iconSizes[size]} />
      ) : (
        <MoonIcon className={iconSizes[size]} />
      )}
    </button>
  )
}
