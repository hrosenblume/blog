'use client'

import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CenteredPage } from '@/components/CenteredPage'
import { Dropdown, DropdownItem } from '@/components/Dropdown'
import { ChevronDownIcon } from '@/components/Icons'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <CenteredPage>
        <p className="text-gray-500">Loading...</p>
      </CenteredPage>
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
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                <span className="text-sm">{session.user?.email}</span>
                <ChevronDownIcon />
              </button>
            }
          >
            <a
              href="/"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              Back to site
            </a>
            <DropdownItem onClick={() => signOut({ callbackUrl: '/' })}>
              Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
