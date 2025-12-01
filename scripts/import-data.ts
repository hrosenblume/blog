/**
 * Import data from JSON files to PostgreSQL database
 * 
 * Usage: npm run db:import:prod
 * 
 * This reads from prisma/data/*.json files (created by export-data.ts)
 * and imports into the PostgreSQL database specified by DATABASE_URL_PROD.
 * 
 * Prerequisites:
 * 1. DATABASE_URL_PROD must be set in .env.local
 * 2. Run npm run db:push:prod first to create the schema
 * 3. Run npm run db:export to create the JSON files
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Connect to PostgreSQL using DATABASE_URL_PROD
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PROD
    }
  }
})

const DATA_DIR = join(process.cwd(), 'prisma', 'data')

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface Post {
  id: string
  title: string
  slug: string
  markdown: string
  status: string
  polyhedraShape: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  subtitle: string | null
}

interface Revision {
  id: string
  postId: string
  title: string | null
  subtitle: string | null
  markdown: string
  polyhedraShape: string | null
  createdAt: string
}

function loadJson<T>(filename: string): T[] {
  const filepath = join(DATA_DIR, filename)
  if (!existsSync(filepath)) {
    console.log(`⚠ No ${filename} found, skipping...`)
    return []
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'))
}

async function importData() {
  if (!process.env.DATABASE_URL_PROD) {
    console.error('❌ DATABASE_URL_PROD is not set in .env.local')
    process.exit(1)
  }

  console.log('📥 Importing data to PostgreSQL...\n')
  console.log(`Target: ${process.env.DATABASE_URL_PROD.replace(/:[^:@]+@/, ':****@')}\n`)

  // Import Users
  const users = loadJson<User>('users.json')
  if (users.length > 0) {
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date(user.createdAt)
        }
      })
    }
    console.log(`✓ Imported ${users.length} users`)
  }

  // Import Posts
  const posts = loadJson<Post>('posts.json')
  if (posts.length > 0) {
    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: {},
        create: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          markdown: post.markdown,
          status: post.status,
          polyhedraShape: post.polyhedraShape,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          subtitle: post.subtitle
        }
      })
    }
    console.log(`✓ Imported ${posts.length} posts`)
  }

  // Import Revisions
  const revisions = loadJson<Revision>('revisions.json')
  if (revisions.length > 0) {
    for (const revision of revisions) {
      await prisma.revision.upsert({
        where: { id: revision.id },
        update: {},
        create: {
          id: revision.id,
          postId: revision.postId,
          title: revision.title,
          subtitle: revision.subtitle,
          markdown: revision.markdown,
          polyhedraShape: revision.polyhedraShape,
          createdAt: new Date(revision.createdAt)
        }
      })
    }
    console.log(`✓ Imported ${revisions.length} revisions`)
  }

  console.log('\n✅ Import complete!')
}

importData()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

