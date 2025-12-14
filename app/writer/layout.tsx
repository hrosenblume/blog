'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageLoader } from '@/components/PageLoader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatPanel } from '@/components/ChatPanel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExternalLinkIcon, ChatIcon } from '@/components/Icons'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [chatOpen, setChatOpen] = useState(false)
  
  const isEditor = pathname?.startsWith('/writer/editor')

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Cmd+/ to toggle to homepage (only on /writer dashboard, not in editor)
  useKeyboard([
    { 
      ...SHORTCUTS.TOGGLE_VIEW, 
      handler: () => { 
        if (pathname === '/writer') {
          router.push('/') 
        }
      } 
    },
  ])

  if (status === 'loading') {
    return <PageLoader />
  }

  if (!session) {
    return null
  }

  return (
    <div className={isEditor ? 'fixed inset-0' : 'min-h-screen'}>
      {!isEditor && (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/writer" className="font-medium flex items-center gap-1.5">
              Writer
              <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">AI</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center ${chatOpen ? 'bg-accent' : ''}`}
                aria-label="Chat with AI"
                title="Chat with AI"
              >
                <ChatIcon />
              </button>
              
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center"
                aria-label="View homepage"
                title="View homepage"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
              
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground hover:ring-2 hover:ring-ring transition-shadow">
                    {session.user?.email?.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {session.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <a href="/admin" target="_blank" rel="noopener noreferrer">
                          Admin Panel
                        </a>
                      </DropdownMenuItem>
                      {process.env.NODE_ENV === 'development' ? (
                        <DropdownMenuItem asChild>
                          <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer">
                            Prisma Studio
                          </a>
                        </DropdownMenuItem>
                      ) : process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL ? (
                        <DropdownMenuItem asChild>
                          <a href={process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                            Database
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}
      
      <main className={isEditor ? '' : 'pt-14'}>
        {children}
      </main>
      
      {/* Chat Panel */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
