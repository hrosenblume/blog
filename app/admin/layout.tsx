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
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
              Admin
            </Link>
            <nav className="flex gap-4">
              {[['Users', '/admin/users'], ['Posts', '/admin/posts'], ['Revisions', '/admin/revisions']].map(([name, href]) => (
                <Link key={href} href={href} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  {name}
                </Link>
              ))}
            </nav>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {session.user?.email}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
