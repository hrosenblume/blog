'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { WriterNavbar } from '@/components/writer/WriterNavbar'
import { ChatProvider, useChatContext } from '@/lib/chat'
import { CenteredPage } from '@/components/CenteredPage'

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const { isOpen: chatOpen, setIsOpen: setChatOpen } = useChatContext()

  // Prevent body scroll for app-like feel
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

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
    redirect('/api/auth/signin')
  }

  // Only admins can access /admin
  if (session.user?.role !== 'admin') {
    return (
      <CenteredPage>
        <div className="text-center">
          <h1 className="text-title font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this page.
          </p>
          <Link 
            href="/writer" 
            className="text-primary hover:underline"
          >
            ← Back to Writer
          </Link>
        </div>
      </CenteredPage>
    )
  }

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      <WriterNavbar
        session={session}
        chatOpen={chatOpen}
        onChatToggle={() => setChatOpen(!chatOpen)}
        fixed={false}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ChatProvider>
  )
}
