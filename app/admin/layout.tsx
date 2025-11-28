'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    redirect('/api/auth/signin')
  }

  // Only admins can access /admin
  if (session.user?.role !== 'admin') {
    redirect('/writer')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
              Admin
            </Link>
            <nav className="flex gap-4">
              <Link 
                href="/admin/users" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Users
              </Link>
              <Link 
                href="/admin/posts" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Posts
              </Link>
              <Link 
                href="/admin/revisions" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Revisions
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/writer" 
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Writer Dashboard
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {session.user?.email}
            </span>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
