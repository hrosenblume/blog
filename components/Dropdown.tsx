'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div 
            className={cn(
              'absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20',
              align === 'right' && 'right-0',
              align === 'left' && 'left-0',
              className
            )}
          >
            <div onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  destructive?: boolean
}

export function DropdownItem({ children, destructive, className, ...props }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg',
        destructive && 'text-red-600',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

