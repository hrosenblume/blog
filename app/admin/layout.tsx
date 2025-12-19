'use client'

import { useState, useEffect } from 'react'
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
import { adminNavGroups, getDirectLinkItems, getGroupItems, filterByFeatureFlags } from '@/lib/admin-nav'

// Derive nav data from shared config (will be filtered by feature flags in component)
const directLinks = getDirectLinkItems()
const navGroups = adminNavGroups.map(group => ({
  label: group.label,
  items: getGroupItems(group.label),
}))

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({})

  // Fetch feature flags for conditional nav items
  useEffect(() => {
    fetch('/api/integrations/settings')
      .then(res => res.json())
      .then(data => {
        setFeatureFlags({
          autoDraftEnabled: !!data.autoDraftEnabled,
        })
      })
      .catch(() => {})
  }, [])

  // Set admin background color and prevent body scroll
  useEffect(() => {
    document.body.style.backgroundColor = 'hsl(var(--muted))'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

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
    <div className="h-dvh bg-muted flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card shadow">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/admin" className="text-section font-bold">
              Admin
            </Link>
            
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Direct links */}
              {directLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(pathname === link.href && "bg-accent")}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              
              {/* Dropdown groups */}
              {navGroups.map((group) => {
                const filteredItems = filterByFeatureFlags(group.items, featureFlags)
                if (filteredItems.length === 0) return null
                const isActive = filteredItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
                return (
                  <DropdownMenu key={group.label}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(isActive && "bg-accent")}
                      >
                        {group.label}
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {filteredItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  {session.user?.email}
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
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
          <nav className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-2">
              {/* Flat list of all nav items */}
              {directLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "block py-2.5 text-muted-foreground hover:text-foreground",
                    pathname === link.href && "text-foreground font-medium"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {navGroups.flatMap((group) => filterByFeatureFlags(group.items, featureFlags)).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "block py-2.5 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "text-foreground font-medium"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="border-t border-border bg-muted/50 px-4 py-3">
              <a href="/" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                Back to site
              </a>
              <Link 
                href="/writer"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Back to writer
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left py-2 text-sm text-destructive"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
