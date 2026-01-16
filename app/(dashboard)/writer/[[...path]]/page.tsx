'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { AutobloggerDashboard, SeoSection, type Session } from 'autoblogger/ui'
import { PolyhedraField } from '@/components/autoblogger/PolyhedraField'

/**
 * Writer dashboard page.
 * AutobloggerDashboard handles all internal state management including
 * ChatProvider, DashboardProvider, editor state, and chat context.
 */
export default function WriterPage() {
  const router = useRouter()
  const { data: nextAuthSession } = useSession()
  
  // Map NextAuth session to autoblogger's Session type
  const session: Session | null = useMemo(() => {
    if (!nextAuthSession) return null
    return {
      user: {
        id: (nextAuthSession.user as { id?: string })?.id,
        name: nextAuthSession.user?.name ?? undefined,
        email: nextAuthSession.user?.email ?? undefined,
        role: (nextAuthSession.user as { role?: string })?.role,
      },
    }
  }, [nextAuthSession])
  
  // Custom fields for this blog
  const fields = useMemo(() => [
    {
      name: 'polyhedraShape',
      label: 'Shape',
      component: PolyhedraField as any,
      position: 'footer' as const,
    },
    {
      name: 'seo',
      position: 'footer' as const,
      component: SeoSection as any,
    },
  ], [])

  return (
    <AutobloggerDashboard 
      basePath="/writer"
      apiBasePath="/api/cms"
      session={session}
      onToggleView={(_, slug) => router.push(slug ? `/e/${slug}` : '/')}
      onSignOut={() => signOut({ callbackUrl: '/' })}
      fields={fields}
    />
  )
}
