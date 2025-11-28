import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user exists in the database
      const email = user.email?.toLowerCase().trim()
      if (!email) {
        return false
      }

      const dbUser = await prisma.user.findUnique({
        where: { email },
      })

      // Allow sign in if user exists in database
      return !!dbUser
    },
    async session({ session }) {
      // Add role to session
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase().trim() },
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
    where: { email: email.toLowerCase().trim() },
    select: { role: true },
  })
  
  return user?.role === 'admin'
}
