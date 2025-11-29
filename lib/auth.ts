import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { NextResponse } from 'next/server'
import { prisma } from './db'

// Extend the session type to include role
declare module 'next-auth' {
  interface Session {
    user: {
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
    }
  }
}

// Email normalization helper
export const normalizeEmail = (email: string) => email.toLowerCase().trim()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const dbUser = await prisma.user.findUnique({ where: { email: normalizeEmail(user.email) } })
      return !!dbUser
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizeEmail(session.user.email) },
          select: { role: true },
        })
        session.user.role = dbUser?.role || 'writer'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Helper to check if user is admin
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { role: true },
  })
  return user?.role === 'admin'
}

// API Response helpers
export const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
export const forbidden = () => NextResponse.json({ error: 'Admin access required' }, { status: 403 })
export const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })
export const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

// Session helpers for API routes
export const requireSession = () => getServerSession(authOptions)

export async function requireAdmin() {
  const session = await requireSession()
  if (!session) return null
  return (await isAdmin(session.user?.email)) ? session : null
}

// Higher-order auth wrappers for API routes
type ApiHandler<T = Response> = (...args: unknown[]) => Promise<T>

export function withSession<T extends ApiHandler>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    const session = await requireSession()
    if (!session) return unauthorized()
    return handler(...args)
  }) as T
}

export function withAdmin<T extends ApiHandler>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    const session = await requireAdmin()
    if (!session) return unauthorized()
    return handler(...args)
  }) as T
}
