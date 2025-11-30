'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Spinner } from '@/components/Spinner'
import { CenteredPage } from '@/components/CenteredPage'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Dropdown, DropdownItem } from '@/components/Dropdown'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
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
    return (
      <CenteredPage>
        <Spinner />
      </CenteredPage>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={isEditor ? 'fixed inset-0' : 'min-h-screen'}>
      {!isEditor && (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-page">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/writer" className="font-medium flex items-center gap-1.5">
              Writer
              <span className="text-xs px-1.5 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded">AI</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                aria-label="View homepage"
                title="View homepage"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <ThemeToggle />
              
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <span className="text-sm">{session.user?.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
              >
                {session.user?.role === 'admin' && (
                  <>
                    <a
                      href="/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      Admin Panel
                    </a>
                    {process.env.NODE_ENV === 'development' ? (
                      <a
                        href="http://localhost:5555"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Prisma Studio
                      </a>
                    ) : process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL ? (
                      <a
                        href={process.env.NEXT_PUBLIC_DATABASE_DASHBOARD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Database
                      </a>
                    ) : null}
                  </>
                )}
                <DropdownItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </header>
      )}
      
      <main className={isEditor ? '' : 'pt-14'}>
        {children}
      </main>
    </div>
  )
}
