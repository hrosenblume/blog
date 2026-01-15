'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard layout - handles auth and loading states.
 * AutobloggerDashboard (used in writer page) provides its own
 * ChatProvider, DashboardProvider, and ChatPanel internally.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

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

  // /settings routes - simple layout
  if (pathname?.startsWith('/settings')) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // /writer routes - AutobloggerDashboard provides full layout
  return <>{children}</>
}
