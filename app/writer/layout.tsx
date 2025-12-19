'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatPanel } from '@/components/ChatPanel'
import { ChatProvider, useChatContext } from '@/lib/chat'
import { WriterNavbar } from '@/components/writer/WriterNavbar'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

function WriterLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen: chatOpen, setIsOpen: setChatOpen } = useChatContext()
  const isEditor = pathname?.startsWith('/writer/editor')

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Disable overscroll bounce for app-like feel
  useEffect(() => {
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.documentElement.style.overscrollBehavior = ''
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  // Keyboard shortcuts for writer layout
  useKeyboard([
    { 
      ...SHORTCUTS.TOGGLE_VIEW, 
      handler: () => { 
        // Cmd+/ to toggle to homepage (only on /writer dashboard, not in editor)
        if (pathname === '/writer') {
          router.push('/') 
        }
      } 
    },
    {
      ...SHORTCUTS.CHAT_TOGGLE,
      handler: () => setChatOpen(!chatOpen),
    },
  ])

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </header>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={isEditor ? 'fixed inset-0' : 'min-h-screen'}>
      {!isEditor && (
        <WriterNavbar
          session={session}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(!chatOpen)}
          inert={chatOpen}
        />
      )}
      
      <main 
        className={isEditor ? '' : 'pt-14'}
        inert={chatOpen && !isEditor ? true : undefined}
      >
        {children}
      </main>
      
      {/* Chat Panel */}
      <ChatPanel />
    </div>
  )
}

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <WriterLayoutContent>{children}</WriterLayoutContent>
    </ChatProvider>
  )
}
