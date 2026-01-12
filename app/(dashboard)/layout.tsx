'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatPanel } from '@/components/ChatPanel'
import { ChatProvider } from 'autoblogger/ui'
import { DashboardProvider } from '@/lib/dashboard'

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll main container to top on navigation
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  // Route detection
  const isWriter = pathname?.startsWith('/writer')
  const isSettings = pathname?.startsWith('/settings')

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

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

  // /settings routes - simple layout, no navbar
  if (isSettings) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // /writer routes - autoblogger provides its own navbar
  return (
    <div className="h-dvh flex flex-col">
      <main ref={mainRef} className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* Chat Panel - available on writer routes */}
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
