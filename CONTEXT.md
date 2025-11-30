# Project Context

> ⚠️ **This file is committed to git.** Do not add sensitive data (API keys, emails, secrets). Use environment variables instead.

## Overview

**Hunter Rosenblume's personal essay blog** — a clean, minimal writing platform built with Next.js 15 (App Router), React 19, Prisma (SQLite), NextAuth.js v5 (Google OAuth), and Tailwind CSS. Features animated 3D polyhedra, keyboard-first navigation, and a DRY configuration system. Requires Node.js 20+.

**Live URLs:**
- Public site: `/`
- Writer dashboard: `/writer` (protected)
- Admin panel: `/admin` (admin only)
- Essays: `/e/[slug]`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20+ (LTS) |
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19 |
| **Database** | SQLite via Prisma |
| **Auth** | NextAuth.js v5 with Google OAuth |
| **Styling** | Tailwind CSS |
| **Theme** | next-themes (dark mode, class-based) |
| **Markdown** | marked + sanitize-html |
| **3D Graphics** | Canvas API (client-side polyhedra rendering) |
| **Build** | standalone output mode |

---

## Project Structure

```
blog/
├── app/                        # Next.js App Router
│   ├── _components/            # App-level client components
│   │   └── HomeKeyboardNav.tsx
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin-only APIs
│   │   │   ├── revisions/      # Revision management + restore
│   │   │   └── users/          # User CRUD
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── posts/              # Posts CRUD + by-slug lookup
│   │   └── upload/             # Image upload
│   ├── admin/                  # Admin dashboard (admin-only)
│   │   ├── posts/              # Posts management
│   │   ├── revisions/          # Revisions viewer + detail
│   │   └── users/              # User management
│   ├── auth/                   # Auth pages
│   ├── e/[slug]/               # Public essay pages
│   │   └── _components/        # Essay-specific components
│   ├── writer/                 # Writer dashboard (protected)
│   │   └── editor/[[...slug]]/ # Markdown editor
│   ├── globals.css             # Global styles + typography variables
│   ├── layout.tsx              # Root layout
│   ├── not-found.tsx           # 404 page
│   ├── page.tsx                # Public homepage
│   └── providers.tsx           # SessionProvider + ThemeProvider
├── components/                 # Shared UI components
│   ├── admin/                  # Admin-specific components
│   ├── Button.tsx              # Button with variants + loading
│   ├── CenteredPage.tsx        # Loading/centered layout wrapper
│   ├── DeleteButton.tsx        # Confirm-delete button
│   ├── Dropdown.tsx            # Dropdown menu
│   ├── EmailLink.tsx           # Anti-spam email link
│   ├── EssayLink.tsx           # Homepage essay row with polyhedra
│   ├── EssayNav.tsx            # Prev/Next essay navigation
│   ├── HomepageFooter.tsx      # Footer with social links
│   ├── PolyhedraCanvas.tsx     # 3D polyhedra renderer
│   ├── SecretNav.tsx           # 5-tap + Cmd+/ navigation
│   ├── Spinner.tsx             # Loading spinner
│   ├── StatusBadge.tsx         # Status pill component
│   ├── TapLink.tsx             # iOS scroll-aware link
│   └── ThemeToggle.tsx         # Dark mode toggle
├── lib/                        # Utilities and configs
│   ├── auth.ts                 # NextAuth config + isAdmin helper
│   ├── db.ts                   # Prisma client singleton
│   ├── homepage.ts             # ✏️ Homepage content config (DRY)
│   ├── keyboard/               # Keyboard navigation system
│   │   ├── index.ts            # Exports
│   │   ├── shortcuts.ts        # Shortcut definitions
│   │   └── useKeyboard.ts      # useKeyboard hook
│   ├── markdown.ts             # Markdown rendering + utils
│   ├── polyhedra/              # 3D polyhedra system
│   │   ├── renderer.ts         # Canvas rendering logic
│   │   ├── shapes.json         # Generated shape data
│   │   └── shapes.ts           # Shape getters
│   ├── styles.ts               # Shared Tailwind class strings (DRY)
│   └── utils/
│       ├── cn.ts               # clsx + tailwind-merge
│       ├── confirm.ts          # Confirmation dialogs
│       └── format.ts           # Date/number formatting
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── dev.db                  # SQLite database (gitignored)
├── public/
│   ├── polyhedra/              # Fallback GIFs for no-JS
│   └── uploads/                # User uploaded images (gitignored)
└── scripts/
    ├── assign-shapes.js        # Assign polyhedra to posts
    └── polyhedra/              # Polyhedra build system
        ├── build-shapes.js     # Generate shapes.json
        ├── data/               # Shape definitions (Platonic, etc.)
        ├── index.js            # GIF generation script
        └── off-parser.js       # OFF file parser
```

---

## Database Schema

```prisma
model Post {
  id             String     @id @default(uuid())
  title          String
  subtitle       String?
  slug           String     @unique
  markdown       String
  status         String     @default("draft")  // "draft" or "published"
  polyhedraShape String?                       // Assigned 3D shape name
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  publishedAt    DateTime?
  revisions      Revision[]
}

model Revision {
  id             String   @id @default(uuid())
  postId         String
  title          String?
  subtitle       String?
  markdown       String
  polyhedraShape String?
  createdAt      DateTime @default(now())
  post           Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
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

## Key Systems

### 1. Typography System (DRY)

All font sizes are defined as CSS variables in `app/globals.css` and exposed as Tailwind utilities via `tailwind.config.js`:

| CSS Variable | Size | Tailwind Class | Usage |
|-------------|------|----------------|-------|
| `--font-title` | 24px | `text-title` | Page titles, author name |
| `--font-h1` | 22px | `text-h1` | Section headers (Notes) |
| `--font-section` | 18px | `text-section` | Essay titles in lists |
| `--font-body` | 16px | `text-body` | Body text, subtitles |

**Rules:**
- Never use raw Tailwind sizes (`text-sm`, `text-lg`) — use the custom scale
- To change a size globally, edit the CSS variable in `globals.css`
- Prose headings (h1-h3) also use these variables

### 2. Homepage Configuration (DRY)

All homepage content lives in `lib/homepage.ts`:

```typescript
export type TextSegment = { text: string; href?: string }
export type FooterLink = { label: string; href?: string; type?: 'email' }

export const HOMEPAGE = {
  name: 'Hunter Rosenblume',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',  // From .env
  
  // Bio: Array of paragraphs, each paragraph is array of segments
  // Segments can have optional href for inline links
  bio: [
    [
      { text: 'I started as a ' },
      { text: 'Thiel Fellow', href: 'https://thielfellowship.org' },
      { text: ', then founded ' },
      { text: 'Ordo', href: 'https://ordo.com' },
      { text: '.' },
    ],
    [{ text: "Ten years into building, I'm sharing my notes." }],
  ] as TextSegment[][],
  
  notes: {
    title: 'Notes',
    maxItems: null,  // null = show all, number to limit
    emptyMessage: 'No notes yet.',
  },
  
  footerLinks: [
    { label: 'Twitter', href: 'https://x.com/...' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/...' },
    { label: 'Email', type: 'email' },  // Uses HOMEPAGE.email
  ] as FooterLink[],
}
```

**Used by:**
- `app/page.tsx` — Name, bio paragraphs, notes section
- `app/e/[slug]/page.tsx` — Author byline
- `app/writer/page.tsx` — Dashboard header
- `components/HomepageFooter.tsx` — Footer social links
- `components/EmailLink.tsx` — Email address

**Bio Rendering Pattern:**
```tsx
{HOMEPAGE.bio.map((paragraph, pIndex) => (
  <p key={pIndex}>
    {paragraph.map((segment, sIndex) =>
      segment.href ? (
        <TapLink key={sIndex} href={segment.href}>{segment.text}</TapLink>
      ) : (
        <span key={sIndex}>{segment.text}</span>
      )
    )}
  </p>
))}
```

Edit `lib/homepage.ts` to change name, bio, email, or footer links globally.

### 3. Polyhedra System

Animated 3D wireframe polyhedra rendered client-side using Canvas:

**Build Pipeline:**
1. `scripts/polyhedra/data/` — Shape definitions (Platonic, Archimedean, etc.)
2. `scripts/polyhedra/build-shapes.js` — Generates `lib/polyhedra/shapes.json`
3. `lib/polyhedra/renderer.ts` — Canvas rendering (rotation, projection, edge colors)
4. `components/PolyhedraCanvas.tsx` — React wrapper with hover acceleration

**Features:**
- 50+ unique shapes from geometry families
- Deterministic edge colors based on shape name
- Smooth speed transitions on hover (4s → 0.375s rotation)
- `prefers-reduced-motion` support
- IntersectionObserver for visibility-based animation
- `<noscript>` fallback GIFs

**Shape Assignment:**
- `scripts/assign-shapes.js` — Assigns random shapes to posts
- Stored in `Post.polyhedraShape` field

### 4. Keyboard Navigation

Centralized keyboard shortcuts in `lib/keyboard/`:

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd + .` | Toggle theme | Global (works in inputs) |
| `Cmd + /` | Toggle view | essay↔editor, home↔writer |
| `←` / `→` | Prev/Next essay | Essay pages |
| `n` | New article | Writer dashboard |
| `Escape` | Back to dashboard | Editor |

**Usage:**
```tsx
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

useKeyboard([
  { ...SHORTCUTS.TOGGLE_VIEW, handler: () => router.push('/writer') },
])
```

### 5. Touch Handling (iOS Safari)

`TapLink` component solves iOS touch ambiguity:
- Detects tap vs scroll by measuring finger movement (< 10px = tap)
- Works with both internal routes and external URLs
- Used in: `EssayNav`, `HomepageFooter`, bio links

**Mobile Scroll Fixes for Fixed Elements:**
When using fixed elements (header, footer, toolbar) with a scrollable content area, iOS Safari can "freeze" scroll if touch starts on a fixed element. Fix with:
- `overscroll-contain` on the main scrollable container (prevents scroll chaining)
- `touch-none` on fixed elements that don't need scroll interaction (prevents touch capture)

```tsx
<main className="flex-1 overflow-auto overscroll-contain">
  {/* scrollable content */}
</main>
<footer className="fixed bottom-0 ... touch-none">
  {/* non-scrollable footer */}
</footer>
```

### 6. Secret Navigation

`SecretNav` wraps the author name on the homepage:
- **5 quick taps** → Navigate to `/writer`
- **Cmd + /** → Navigate to `/writer`
- Remembers last writer path in localStorage

### 7. Shared Styles (DRY)

`lib/styles.ts` exports reusable Tailwind class strings:

```typescript
export const tableHeaderClass = 'px-6 py-3 text-left text-xs ...'
export const cellClass = 'px-6 py-4 whitespace-nowrap text-sm ...'
export const linkClass = 'text-blue-600 hover:text-blue-800 ...'
```

Used across admin tables for consistent styling.

---

## Authentication & Authorization

### How Auth Works
1. **Google OAuth** via NextAuth.js
2. **Allowlist model**: Only users in the `User` table can sign in
3. **Role-based access**:
   - `admin`: Full access to `/admin` + `/writer`
   - `writer`: Access to `/writer` only

### First-Time Setup
Set `WRITER_EMAIL` and `WRITER_NAME` in `.env.local`, then run `npm run db:setup` to create your admin user. The email must match your Google account.

### Key Auth Logic (`lib/auth.ts`)
- `signIn` callback: Checks if user email exists in database
- `session` callback: Attaches user role to session
- `isAdmin()` helper: Checks if email has admin role

### Protected Routes
- `/writer/*`: Requires authenticated session
- `/admin/*`: Requires session + admin role

---

## API Routes

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/posts` | GET | List all posts | Required |
| `/api/posts` | POST | Create new post | Required |
| `/api/posts/[id]` | GET/PATCH/DELETE | Single post CRUD | Required |
| `/api/posts/by-slug/[slug]` | GET | Get post by slug | Required |
| `/api/upload` | POST | Upload image | Required |
| `/api/admin/users` | GET/POST | List/create users | Admin |
| `/api/admin/users/[id]` | PATCH/DELETE | Manage user | Admin |
| `/api/admin/revisions/[id]` | GET/DELETE | View/delete revision | Admin |
| `/api/admin/revisions/[id]/restore` | POST | Restore revision | Admin |

---

## Key Features

### Public Homepage (`app/page.tsx`)
- Displays published essays with polyhedra, title, subtitle
- Uses `revalidate = 60` for ISR
- Configurable via `lib/homepage.ts`

### Writer Dashboard (`app/writer/page.tsx`)
- Stats: total posts, published, drafts, word count
- Search/filter posts
- Quick actions: edit, publish, unpublish, delete
- Keyboard shortcut: `n` for new essay

### Markdown Editor (`app/writer/editor/[[...slug]]/page.tsx`)
- Title + subtitle inputs with auto-generated slug
- Markdown textarea with live preview toggle
- Auto-save drafts (3-second debounce)
- Word count in status bar
- Revision history (automatic on each save)
- Polyhedra shape selection

### Essay Pages (`app/e/[slug]/page.tsx`)
- SSG with `generateStaticParams`
- Rendered markdown with prose styling
- Previous/Next essay navigation
- Author byline (from `lib/homepage.ts`) and publish date
- Keyboard nav: `←`/`→` for prev/next, `Cmd+/` to edit

### Admin Panel (`app/admin/`)
- Dashboard with stats
- User management: add, edit, delete, change roles
- Posts management
- Revisions viewer with restore functionality
- Paginated tables

---

## Design System

### Colors
- **Light mode**: White background (`--bg-page: white`), black text
- **Dark mode**: Black background (`--bg-page: black`), white text
- Gray accents for secondary text and borders
- Smooth CSS transitions between themes (150ms)

### Typography
- Font: Inter (via `next/font/google`)
- Custom typography scale via CSS variables
- Prose styles in `globals.css`

### Components
- Minimal, clean design
- Consistent hover states (`hover:bg-gray-50 dark:hover:bg-gray-900/30`)
- Primary buttons: `bg-gray-900 dark:bg-white`
- Secondary buttons: `bg-gray-200 dark:bg-gray-800`

### Accessibility
- `prefers-reduced-motion` support for polyhedra
- `touch-action: manipulation` to disable tap delay
- Semantic HTML and ARIA labels
- Keyboard navigation throughout

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=                # Leave empty for auto-detection (dev:tunnel sets this automatically)
NEXTAUTH_SECRET="<random-secret>"
AUTH_TRUST_HOST=true         # Allows OAuth from multiple hosts (localhost, ngrok, etc.)

# Google OAuth
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Contact email (public - visible in browser for mailto links)
NEXT_PUBLIC_CONTACT_EMAIL="your-email@example.com"

# Admin user for seeding (used by npm run db:seed)
WRITER_EMAIL="your-email@example.com"
WRITER_NAME="Your Name"

# Ngrok for mobile testing (optional)
# NGROK_AUTHTOKEN="<your-ngrok-authtoken>"
```

### Initial Setup
```bash
cp .env.example .env.local   # Copy template
# Edit .env.local with your real values
npm run db:setup             # Push schema + seed admin user
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost only) |
| `npm run dev:tunnel` | Start dev server + ngrok tunnel with OAuth protection |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed admin user + sample essays |
| `npm run db:setup` | Run db:push + db:seed (first-time setup) |
| `node scripts/polyhedra/build-shapes.js` | Regenerate shapes.json |
| `node scripts/assign-shapes.js` | Assign shapes to posts |

---

## ngrok Tunnel (Mobile Testing)

The project includes a tunneling setup for testing on real mobile devices with OAuth protection.

### How It Works

**`npm run dev:tunnel`** starts both Next.js and ngrok in one command:

```bash
export $(grep -v '^#' .env.local | xargs) && \
NEXTAUTH_URL=https://<ngrok-domain> next dev & \
ngrok http 3000 --domain=<ngrok-domain> --oauth=google --oauth-allow-email=$WRITER_EMAIL
```

1. Loads environment variables from `.env.local`
2. Sets `NEXTAUTH_URL` to the ngrok domain (overrides auto-detection)
3. Starts Next.js dev server in background
4. Starts ngrok with Google OAuth protection

### Two-Layer Authentication

When accessing via ngrok tunnel:

1. **ngrok OAuth layer** — Anyone accessing the tunnel URL must authenticate with Google. Only emails matching `$WRITER_EMAIL` are allowed through.
2. **App NextAuth layer** — Your app's normal authentication. Users must exist in the database.

This provides security-in-depth: even if someone guesses your ngrok URL, they can't access it without your Google account.

### Middleware (`middleware.ts`)

Handles proxy headers so NextAuth generates correct OAuth callback URLs:

```typescript
export function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('host', forwardedHost)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|polyhedra|uploads).*)'],
}
```

The middleware runs on all routes (except static files) to ensure the correct host header is set.

### Google OAuth Console Setup

For OAuth to work on both localhost AND ngrok, add both callback URLs in Google Cloud Console:

- `http://localhost:3000/api/auth/callback/google`
- `https://<your-ngrok-domain>/api/auth/callback/google`

### Auth Configuration

In `lib/auth.ts`:
- `trustHost: true` — Allows NextAuth to work from multiple origins
- Works automatically with the middleware forwarding headers

### next.config.js

The `allowedDevOrigins` config allows ngrok domains in development:

```javascript
allowedDevOrigins: [
  '<your-ngrok-domain>',
  '*.ngrok.dev',
  '*.ngrok-free.app',
],
```

---

## Patterns & Conventions

### Path Aliases
- `@/*` maps to project root (e.g., `@/lib/auth`, `@/components/Button`)

### Data Fetching
- Server Components fetch directly via Prisma
- Client Components use API routes
- `revalidate` for ISR on public pages
- `dynamic = 'force-dynamic'` for admin pages

### DRY Principles
1. **Typography**: CSS variables + Tailwind utilities
2. **Homepage content**: `lib/homepage.ts`
3. **Shared styles**: `lib/styles.ts`
4. **Keyboard shortcuts**: `lib/keyboard/shortcuts.ts`
5. **Polyhedra shapes**: Generated from single source of truth

### Error Handling
- 404: Custom `not-found.tsx`
- Auth errors: Redirect to `/auth/error`
- API errors: JSON responses with appropriate status codes

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Server Components by default
- `'use client'` only when needed
- Use `cn()` for conditional classes

### Git Workflow
When committing changes (user types "g"):
1. Run `git add -A` then `git diff --staged --stat` to see all file changes
2. Read ALL modified files from `git status` (not just new/deleted)
3. Review the **ENTIRE chat history** from the session for full context
4. If new patterns/systems/configs were added, update `CONTEXT.md` and `.cursorrules` (no sensitive data)
5. Write comprehensive commit messages summarizing ALL changes
6. Be thorough — full context from all chats is required
