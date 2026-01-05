'use client'

import { useRef } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Session } from 'next-auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChatIcon } from '@/components/Icons'

interface WriterNavbarProps {
  session?: Session | null
  chatOpen?: boolean
  onChatToggle?: () => void
  leftSlot?: React.ReactNode  // Back arrow for editor (replaces Writer link)
  rightSlot?: React.ReactNode // Save icon for editor (drafts only)
  inert?: boolean // For accessibility when chat panel is open
  fixed?: boolean // Whether navbar should be fixed positioned (default: true)
}

export function WriterNavbar({
  session,
  chatOpen,
  onChatToggle,
  leftSlot,
  rightSlot,
  inert,
  fixed = true,
}: WriterNavbarProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isSettings = pathname?.startsWith('/settings')

  return (
    <header 
      className={`border-b border-border bg-background ${fixed ? 'fixed top-0 left-0 right-0 z-50' : ''}`}
      {...(inert && { inert: true })}
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left side: Writer link or custom slot (back arrow) */}
        {leftSlot ?? (
          <Link href="/writer" className="font-medium flex items-center gap-1.5">
            Writer
            <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">AI</span>
          </Link>
        )}
        
        {/* Right side: icons and user menu */}
        <div className="flex items-center gap-2">
          {/* Custom right slot (Save icon for drafts) */}
          {rightSlot}
          
          {!isSettings && onChatToggle && (
            <button
              type="button"
              onClick={onChatToggle}
              className={`w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center touch-manipulation ${chatOpen ? 'bg-accent' : ''}`}
              aria-label="Chat with AI"
              title="Chat with AI"
            >
              <ChatIcon />
            </button>
          )}
          
          <ThemeToggle />
          
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  ref={triggerRef}
                  className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground hover:ring-2 hover:ring-ring transition-shadow"
                >
                  {session.user?.email?.charAt(0).toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                onCloseAutoFocus={(e) => {
                  // Prevent focus returning to trigger (causes scroll jump on mobile)
                  e.preventDefault()
                  triggerRef.current?.blur()
                }}
              >
                {session.user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={isSettings ? '/writer' : '/settings'}>
                        {isSettings ? 'Back to writer' : 'Go to settings'}
                      </Link>
                    </DropdownMenuItem>
                    {process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL && (
                      <DropdownMenuItem asChild>
                        <a href={process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                          Database
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    View website
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

