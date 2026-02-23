import { createAutoblogger, createStorageHandler } from 'autoblogger'
import { auth } from './auth'
import { prisma } from './db'
import { canPublish } from './auth/helpers'
import { getRandomShape } from './polyhedra/shapes'

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
    upload: createStorageHandler(
      process.env.SPACES_KEY && process.env.SPACES_SECRET
        ? {
            s3: {
              accessKeyId: process.env.SPACES_KEY,
              secretAccessKey: process.env.SPACES_SECRET,
              bucket: process.env.SPACES_BUCKET || 'uploads',
              region: process.env.SPACES_REGION || 'sfo3',
              endpoint: process.env.SPACES_ENDPOINT,
              cdnEndpoint: process.env.SPACES_CDN_ENDPOINT,
              acl: 'public-read',
            },
          }
        : undefined
    ),
  },

  hooks: {
    // Add polyhedra shape to auto-drafted posts
    onAutoDraftPostCreate: async () => ({
      polyhedraShape: getRandomShape(),
    }),
  },

  // Styles now come from autoblogger defaults (ARTICLE_CLASSES)
  // To customize, pass a styles object here
})
