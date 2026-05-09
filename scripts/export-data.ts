/**
 * Export data from SQLite database to JSON files
 * 
 * Usage: bun run db:export
 * 
 * This reads from the local SQLite database (prisma/dev.db) and exports
 * all data to prisma/data/*.json files for importing into PostgreSQL.
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

const DATA_DIR = join(process.cwd(), 'prisma', 'data')

async function exportData() {
  console.log('📦 Exporting data from SQLite...\n')

  // Ensure data directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  // Export Users
  const users = await prisma.user.findMany()
  writeFileSync(
    join(DATA_DIR, 'users.json'),
    JSON.stringify(users, null, 2)
  )
  console.log(`✓ Exported ${users.length} users`)

  // Export Posts (without revisions relation, we'll export separately)
  const posts = await prisma.post.findMany()
  writeFileSync(
    join(DATA_DIR, 'posts.json'),
    JSON.stringify(posts, null, 2)
  )
  console.log(`✓ Exported ${posts.length} posts`)

  // Export Revisions
  const revisions = await prisma.revision.findMany()
  writeFileSync(
    join(DATA_DIR, 'revisions.json'),
    JSON.stringify(revisions, null, 2)
  )
  console.log(`✓ Exported ${revisions.length} revisions`)

  console.log(`\n✅ Data exported to ${DATA_DIR}`)
  console.log('\nNext steps:')
  console.log('1. Set up your DATABASE_URL_PROD in .env.local')
  console.log('2. Run: bun run db:push:prod')
  console.log('3. Run: bun run db:import:prod')
}

exportData()
  .catch((e) => {
    console.error('❌ Export failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

