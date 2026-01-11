'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatPanel } from '@/components/ChatPanel'
import { ChatProvider, useChatContext } from '@/lib/chat'
import { DashboardProvider, useDashboardContext } from '@/lib/dashboard'
import { WriterNavbar } from '@/components/writer/WriterNavbar'
import { MagicBackButton } from '@/components/MagicBackButton'

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen: chatOpen, setIsOpen: setChatOpen } = useChatContext()
  const { editorState } = useDashboardContext()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll main container to top on navigation
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  // Route detection
  const isEditor = pathname?.startsWith('/writer/editor')
  const isWriterRoot = pathname === '/writer'
  const isSettings = pathname?.startsWith('/settings')
  const isWriterSubpage = pathname?.startsWith('/writer/') && !isEditor

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Compute back link for non-root pages
  const getBackLink = () => {
    if (isSettings) {
      // /settings -> /writer, /settings/users -> /settings, etc.
      const segments = pathname?.split('/').filter(Boolean) || []
      return segments.length > 1 
        ? '/' + segments.slice(0, -1).join('/')
        : '/writer'
    }
    if (isWriterSubpage || isEditor) {
      return '/writer'
    }
    return '/writer'
  }

  // Compute left slot based on route
  const getLeftSlot = () => {
    if (isWriterRoot) {
      return undefined // Default "Writer AI" link
    }
    
    // For editor, use the confirmLeave from editor state
    if (isEditor && editorState) {
      return (
        <MagicBackButton 
          backLink="/writer" 
          onBeforeNavigate={editorState.confirmLeave}
        />
      )
    }
    
    // For settings pages, force using computed link (prevents back loops)
    // For other pages, allow browser history
    return <MagicBackButton backLink={getBackLink()} forceLink={isSettings} />
  }

  // Compute right slot based on route
  const getRightSlot = () => {
    // Only show save button for editor with drafts
    if (isEditor && editorState && editorState.status === 'draft') {
      return (
        <button
          type="button"
          onClick={() => editorState.onSave('draft')}
          disabled={!editorState.hasUnsavedChanges || editorState.savingAs !== null}
          className="w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          aria-label="Save draft"
          title="Save draft"
        >
          {editorState.savingAs === 'draft' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </button>
      )
    }
    return undefined
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-background">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
    <div className={isEditor ? 'h-dvh flex flex-col' : 'h-dvh flex flex-col overflow-hidden'}>
      <WriterNavbar
        session={session}
        chatOpen={chatOpen}
        onChatToggle={() => setChatOpen(!chatOpen)}
        leftSlot={getLeftSlot()}
        rightSlot={getRightSlot()}
        fixed={false}
      />
      
      <main ref={mainRef} className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* Chat Panel - available across all dashboard routes */}
      <ChatPanel />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <ChatProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ChatProvider>
    </DashboardProvider>
  )
}

