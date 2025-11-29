# Project Context

## Overview

This is **Hunter Rosenblume's personal essay blog** — a clean, minimal writing platform built with **Next.js 13 (App Router)**, **Prisma** (SQLite), **NextAuth.js** (Google OAuth), and **Tailwind CSS**. The blog features a public homepage displaying published essays, a protected writer dashboard for authoring/editing posts in Markdown, and an admin panel for user and content management.

**Live URLs:**
- Public site: `/`
- Writer dashboard: `/writer` (protected)
- Admin panel: `/admin` (admin only)
- Essays: `/e/[slug]`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 13 (App Router) |
| **Database** | SQLite via Prisma |
| **Auth** | NextAuth.js with Google OAuth |
| **Styling** | Tailwind CSS |
| **Theme** | next-themes (dark mode) |
| **Markdown** | marked + sanitize-html |
| **Build** | standalone output mode |

---

## Project Structure

```
blog/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── admin/users/      # Admin user management API
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── posts/            # Posts CRUD API
│   │   │   └── [id]/         # Single post operations
│   │   └── upload/           # Image upload API
│   ├── admin/                # Admin dashboard (admin-only)
│   │   ├── layout.tsx        # Admin layout with nav
│   │   ├── page.tsx          # Admin dashboard home
│   │   ├── posts/            # Posts management
│   │   ├── revisions/        # Revisions viewer
│   │   └── users/            # User management
│   ├── auth/                 # Auth pages
│   │   ├── signin/           # Google sign-in page
│   │   └── error/            # Auth error page
│   ├── e/[slug]/             # Public essay pages (SSG)
│   ├── writer/               # Writer dashboard (protected)
│   │   ├── layout.tsx        # Writer layout with header
│   │   ├── page.tsx          # Dashboard with post list
│   │   └── editor/[[...id]]/ # Markdown editor
│   ├── globals.css           # Global styles + prose styles
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   ├── page.tsx              # Public homepage
│   └── providers.tsx         # SessionProvider + ThemeProvider
├── components/               # Shared UI components
│   ├── Button.tsx            # Button with variants + loading
│   ├── Dropdown.tsx          # Dropdown menu component
│   ├── EmailLink.tsx         # Anti-spam email link
│   ├── SecretNav.tsx         # Hidden nav (5-tap or Cmd+/)
│   └── Spinner.tsx           # Loading spinner
├── lib/                      # Utility libraries
│   ├── auth.ts               # NextAuth config + isAdmin helper
│   ├── db.ts                 # Prisma client singleton
│   ├── markdown.ts           # Markdown rendering + utils
│   └── utils/
│       ├── cn.ts             # clsx + tailwind-merge
│       └── format.ts         # Date/number formatting
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Django migration script
│   └── dev.db                # SQLite database (gitignored)
├── public/
│   ├── polyhedra/            # Generated polyhedra GIFs
│   └── uploads/              # User uploaded images (gitignored)
├── scripts/
│   └── generate-polyhedra.js # 3D polyhedra GIF generator
└── _legacy/                  # Old Django version (archived, gitignored)
```

---

## Database Schema

```prisma
model Post {
  id          String     @id @default(uuid())
  title       String
  slug        String     @unique
  markdown    String
  status      String     @default("draft")  // "draft" or "published"
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  publishedAt DateTime?
  revisions   Revision[]
}

model Revision {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  markdown  String
  createdAt DateTime @default(now())
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      String   @default("writer")  // "admin" or "writer"
  createdAt DateTime @default(now())
}
```

---

## Authentication & Authorization

### How Auth Works
1. **Google OAuth** via NextAuth.js
2. **Allowlist model**: Only users in the `User` table can sign in
3. **Role-based access**:
   - `admin`: Full access to `/admin` + `/writer`
   - `writer`: Access to `/writer` only

### Key Auth Logic (`lib/auth.ts`)
- `signIn` callback: Checks if user email exists in database
- `session` callback: Attaches user role to session
- `isAdmin()` helper: Checks if email has admin role

### Protected Routes
- `/writer/*`: Requires authenticated session
- `/admin/*`: Requires session + admin role (redirects to `/writer` otherwise)

---

## API Routes

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/posts` | GET | List all posts | Required |
| `/api/posts` | POST | Create new post | Required |
| `/api/posts/[id]` | GET | Get single post | Required |
| `/api/posts/[id]` | PATCH | Update post | Required |
| `/api/posts/[id]` | DELETE | Delete post | Required |
| `/api/upload` | POST | Upload image | Required |
| `/api/admin/users` | GET | List users | Admin |
| `/api/admin/users` | POST | Create user | Admin |
| `/api/admin/users/[id]` | PATCH/DELETE | Manage user | Admin |

---

## Key Features

### Public Homepage (`app/page.tsx`)
- Displays published essays with title, subtitle, date, read time
- Uses `revalidate = 60` for ISR
- Links to `/e/[slug]` for each essay
- Social links in footer (Twitter, LinkedIn, Email)

### Secret Navigation (`components/SecretNav.tsx`)
- **5 taps** on "Hunter Rosenblume" → `/writer`
- **Cmd + /** keyboard shortcut → `/writer`
- Remembers last writer path in localStorage

### Writer Dashboard (`app/writer/page.tsx`)
- Stats: total posts, published, drafts, word count
- Search/filter posts
- Quick actions: edit, view live, unpublish, delete
- "New Article" button

### Markdown Editor (`app/writer/editor/[[...id]]/page.tsx`)
- Title input with auto-generated slug
- Markdown textarea with live preview toggle
- Auto-save drafts (3-second debounce)
- Word count in status bar
- Save Draft / Publish buttons
- Revision history (automatic on each save)

### Essay Pages (`app/e/[slug]/page.tsx`)
- SSG with `generateStaticParams`
- Rendered markdown with prose styling
- Previous/Next essay navigation
- Author byline and publish date

### Admin Panel (`app/admin/`)
- Dashboard with stats (users, posts, revisions)
- User management: add, edit, delete, change roles
- Posts management: view, edit, delete
- Revisions viewer

---

## Design System

### Colors
- **Light mode**: White background, black text, gray accents
- **Dark mode**: Black background, white text, gray accents
- Class-based dark mode via `next-themes`

### Typography
- Font: Inter (Google Fonts)
- Prose styles defined in `globals.css`

### Components
- Minimal, clean design
- Consistent hover states
- Responsive layouts
- Primary buttons: `bg-gray-900 dark:bg-white text-white dark:text-gray-900`
- Secondary buttons: `bg-gray-200 dark:bg-gray-800`

---

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<random-secret>"
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Import posts from legacy Django DB |

---

## Polyhedra GIF Generator

Script at `scripts/generate-polyhedra.js` creates animated 3D rotating polyhedra GIFs:

```bash
node scripts/generate-polyhedra.js --shape icosahedron --size 300 --output public/polyhedra/demo.gif
```

Shapes: tetrahedron, cube, octahedron, icosahedron, dodecahedron, cuboctahedron

---

## Legacy Migration

The `_legacy/` folder contains the original Django implementation. The Prisma seed script (`prisma/seed.ts`) imports posts and revisions from the Django SQLite database:

```bash
npm run db:seed
```

This also creates the initial admin user (`your-email@example.com`).

---

## Patterns & Conventions

### Path Aliases
- `@/*` maps to project root (e.g., `@/lib/auth`, `@/components/Button`)

### Data Fetching
- Server Components fetch directly via Prisma
- Client Components use API routes
- `revalidate` for ISR on public pages
- `dynamic = 'force-dynamic'` for admin pages

### Error Handling
- 404: Custom `not-found.tsx`
- Auth errors: Redirect to `/auth/error`
- API errors: JSON responses with appropriate status codes

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Server Components by default
- `'use client'` only when needed

---

## Future Plans (from legacy docs)

1. **AI Prompting in Writer**: Access to past essays to "write like me"
2. **Auto-saving & Version History UI**: Better revision browsing
3. **Design System**: Extract tokens and patterns from Figma
4. **Image Management**: Better upload/gallery experience


