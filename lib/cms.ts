import { createAutoblogger } from 'autoblogger'
import { auth } from './auth'
import { prisma } from './db'
import { uploadFile } from './storage'
import { canPublish } from './auth/helpers'

// Create autoblogger CMS instance
export const cms = createAutoblogger({
  prisma,

  auth: {
    getSession: async () => {
      const session = await auth()
      // Cast to autoblogger's Session type
      return session as any
    },
    isAdmin: (session) => session?.user?.role === 'admin',
    canPublish: (session) => canPublish(session?.user?.role),
  },

  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },

  storage: {
    upload: async (file: File) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadFile(buffer, file.name, file.type)
      return { url: result.url }
    },
  },

  // Custom styles to match the blog's article layout
  styles: {
    container: 'max-w-[680px] mx-auto px-6',
    title: 'text-title font-bold',
    subtitle: 'text-h2 text-muted-foreground',
    byline: 'text-sm text-muted-foreground',
    prose: 'prose dark:prose-invert max-w-none',
  },
})

// Export styles for client-side use
export const cmsStyles = cms.config.styles
