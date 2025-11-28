/**
 * Migration script to import posts from Django SQLite database
 * 
 * Usage: npm run db:seed
 * 
 * This script reads from the Django db.sqlite3 and imports posts into the new Prisma database.
 */

import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import { join } from 'path'

const prisma = new PrismaClient()

interface DjangoPost {
  id: string
  title: string
  slug: string
  markdown: string
  status: string
  created_at: string
  updated_at: string
  published_at: string | null
}

interface DjangoRevision {
  id: string
  post_id: string
  markdown: string
  created_at: string
}

async function main() {
  // Seed initial admin user
  const adminEmail = 'your-email@example.com'
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Hunter Rosenblume',
        role: 'admin',
      },
    })
    console.log(`Created admin user: ${adminEmail}`)
  } else {
    console.log(`Admin user already exists: ${adminEmail}`)
  }

  // Migrate posts from Django database
  const djangoDbPath = join(process.cwd(), '_legacy', 'db.sqlite3')
  
  console.log(`Looking for Django database at: ${djangoDbPath}`)
  
  let db: Database.Database
  try {
    db = new Database(djangoDbPath, { readonly: true })
  } catch (e) {
    console.log('No Django database found. Starting with empty database.')
    return
  }

  console.log('Connected to Django database')

  // Get posts from Django
  const posts = db.prepare(`
    SELECT id, title, slug, markdown, status, created_at, updated_at, published_at
    FROM writer_post
  `).all() as DjangoPost[]

  console.log(`Found ${posts.length} posts to migrate`)

  for (const post of posts) {
    // Check if post already exists (by slug)
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`  Skipping "${post.title}" (already exists)`)
      continue
    }

    // Get revisions for this post
    const revisions = db.prepare(`
      SELECT id, post_id, markdown, created_at
      FROM writer_revision
      WHERE post_id = ?
      ORDER BY created_at ASC
    `).all(post.id) as DjangoRevision[]

    // Create post with revisions
    await prisma.post.create({
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        markdown: post.markdown,
        status: post.status,
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        publishedAt: post.published_at ? new Date(post.published_at) : null,
        revisions: {
          create: revisions.map(rev => ({
            id: rev.id,
            markdown: rev.markdown,
            createdAt: new Date(rev.created_at),
          })),
        },
      },
    })

    console.log(`  Migrated "${post.title}"`)
  }

  db.close()
  console.log('\nMigration complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

