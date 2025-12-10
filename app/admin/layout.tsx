'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import { CenteredPage } from '@/components/CenteredPage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, MenuIcon } from '@/components/Icons'
import { cn } from '@/lib/utils/cn'

const navLinks = [
  ['Users', '/admin/users'],
  ['Posts', '/admin/posts'],
  ['Revisions', '/admin/revisions'],
  ['Leads', '/admin/leads'],
  ['Visits', '/admin/leads/visits'],
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  if (status === 'loading') {
    return (
      <CenteredPage>
        <p className="text-muted-foreground">Loading...</p>
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
    <div className="fixed inset-0 flex flex-col bg-muted">
      <header className="flex-shrink-0 bg-card shadow">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/admin" className="text-lg md:text-xl font-bold">
              Admin
            </Link>
            
            {/* Desktop nav */}
            <nav className="hidden md:flex gap-4">
              {navLinks.map(([name, href]) => (
                <Link 
                  key={href} 
                  href={href} 
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    pathname === href && "text-foreground font-medium"
                  )}
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile nav toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <MenuIcon />
            </Button>

            {/* User dropdown - hidden on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden md:flex">
                  <span className="text-sm">{session.user?.email}</span>
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="/">Back to site</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/writer">Back to writer</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile nav menu */}
        {mobileNavOpen && (
          <nav className="md:hidden border-t border-border bg-card px-4 py-2">
            {navLinks.map(([name, href]) => (
              <Link 
                key={href} 
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "block py-3 text-muted-foreground hover:text-foreground",
                  pathname === href && "text-foreground font-medium"
                )}
              >
                {name}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <a href="/" className="block py-3 text-muted-foreground hover:text-foreground">
                Back to site
              </a>
              <Link 
                href="/writer"
                onClick={() => setMobileNavOpen(false)}
                className="block py-3 text-muted-foreground hover:text-foreground"
              >
                Back to writer
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left py-3 text-destructive"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
