'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CenteredPage } from '@/components/CenteredPage'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  // Still loading - parent layout handles skeleton
  if (status === 'loading') {
    return null
  }

  // Not authenticated - parent layout handles redirect
  if (!session) {
    return null
  }

  // Only admins can access /settings
  if (session.user?.role !== 'admin') {
    return (
      <CenteredPage>
        <div className="text-center">
          <h1 className="text-title font-bold mb-4">Settings Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access settings.
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
    <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
      {children}
    </div>
  )
}

