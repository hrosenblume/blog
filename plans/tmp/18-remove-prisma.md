# Remove Prisma

## Goal
Remove Prisma from the project as it's not providing value. Clean up all references.

## Current State
- Prisma is used for SQLite database access
- Schema defined in `prisma/schema.prisma`
- Client imported from `@/lib/db`

## Why Remove?
- Overhead for simple SQLite usage
- Could use simpler alternatives (better-sqlite3, Drizzle)
- Reduce dependencies and complexity

## Alternatives

### Option A: better-sqlite3
Synchronous, simple SQLite wrapper.

```tsx
import Database from 'better-sqlite3'
const db = new Database('prisma/dev.db')

// Query
const posts = db.prepare('SELECT * FROM Post WHERE status = ?').all('published')
```

### Option B: Drizzle ORM
Type-safe, lightweight ORM.

```tsx
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { posts } from './schema'

const db = drizzle(sqlite)
const allPosts = await db.select().from(posts).where(eq(posts.status, 'published'))
```

### Option C: sql.js (Browser-compatible)
SQLite compiled to WebAssembly.

## Recommended: Option B - Drizzle

### Migration Steps

#### 1. Install Drizzle

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

#### 2. Create Drizzle Schema

Create `lib/db/schema.ts`:

```tsx
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('User', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('writer'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
})

export const posts = sqliteTable('Post', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status').notNull().default('draft'),
  shape: text('shape'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})
```

#### 3. Create Drizzle Client

Update `lib/db.ts`:

```tsx
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './db/schema'

const sqlite = new Database('prisma/dev.db')
export const db = drizzle(sqlite, { schema })
```

#### 4. Update Queries

Before (Prisma):
```tsx
const posts = await prisma.post.findMany({
  where: { status: 'published' },
  orderBy: { createdAt: 'desc' },
})
```

After (Drizzle):
```tsx
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const allPosts = await db
  .select()
  .from(posts)
  .where(eq(posts.status, 'published'))
  .orderBy(desc(posts.createdAt))
```

#### 5. Update All Files Using Prisma

Files to update:
- `app/page.tsx`
- `app/e/[slug]/page.tsx`
- `app/writer/page.tsx`
- `app/writer/editor/[[...slug]]/page.tsx`
- `app/admin/posts/page.tsx`
- `app/admin/users/page.tsx`
- `app/api/posts/route.ts`
- `app/api/posts/[id]/route.ts`
- `app/api/admin/users/route.ts`
- All other API routes

#### 6. Remove Prisma

```bash
npm uninstall prisma @prisma/client
rm -rf prisma/
# Or keep prisma/ for the database file, just remove schema.prisma
```

#### 7. Update Scripts

Update `package.json`:
```json
{
  "scripts": {
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate:sqlite"
  }
}
```

## Files to Modify
- `lib/db.ts` - Replace Prisma client with Drizzle
- `lib/db/schema.ts` - Create Drizzle schema
- All files importing from `@/lib/db`
- All API routes with database queries
- `package.json` - Update scripts, dependencies
- Delete `prisma/schema.prisma`

## Testing Checklist
- [ ] All pages load correctly
- [ ] Can create new posts
- [ ] Can edit posts
- [ ] Can delete posts
- [ ] User authentication works
- [ ] Admin functions work
- [ ] No Prisma references remain
- [ ] Database migrations work

## Rollback Plan
Keep a backup of:
- `prisma/schema.prisma`
- `lib/db.ts` (original)
- `package.json` (original)

