# Blog (Hunter Rosenblume)

Personal essay site. Next.js 16 (App Router), React 19, Prisma, NextAuth.js v5 (Google OAuth), Tailwind CSS, animated 3D polyhedra, keyboard-first navigation. Consumes the `autoblogger` package for AI writing, chat, and CMS features.

**This file replaces `.cursor/rules/`.** No sensitive data here — no emails, URLs, passwords, API keys; use env var references.

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Package manager | bun (`bun install`, `bun run dev`, lockfile `bun.lock`) |
| Framework | Next.js 16 (App Router) — Turbopack |
| UI | React 19 |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| Auth | NextAuth.js v5 (Google OAuth) |
| Styling | Tailwind CSS |
| Theme | next-themes (class-based dark mode) |
| Editor | Tiptap WYSIWYG (markdown via marked + turndown) |
| AI / CMS | `autoblogger` package (Claude/GPT, chat, dashboard, public API) |
| 3D Graphics | Canvas API (client-side polyhedra) |
| Image Storage | Local filesystem (dev) / DigitalOcean Spaces (prod) |

## Project structure

```
blog/
├── app/                            # Next.js App Router
│   ├── api/                        # API routes
│   │   ├── admin/                  # Admin-only APIs (users, revisions, topics)
│   │   ├── cms/[...path]/          # Internal autoblogger API (session-auth)
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   └── posts/                  # Posts CRUD wrapper
│   ├── (dashboard)/                # Dashboard layout group
│   │   ├── settings/               # Settings pages
│   │   └── writer/
│   │       ├── [[...path]]/        # Writer dashboard (catch-all)
│   │       └── api/[...path]/      # PUBLIC autoblogger API (bearer-auth)
│   ├── auth/                       # Auth pages
│   ├── e/[slug]/                   # Public essay pages
│   └── layout.tsx                  # Root
├── components/                     # Shared UI (admin/, autoblogger/, ui/)
├── lib/                            # Utilities and configs
│   ├── cms.ts                      # Configures autoblogger instance
│   ├── auth.ts                     # NextAuth + route protection
│   ├── db.ts                       # Prisma singleton
│   ├── homepage.ts                 # ✏️ Homepage content (single source of truth)
│   ├── admin-nav.ts                # ✏️ Admin nav config
│   ├── markdown.ts                 # Re-exports from autoblogger + sanitized render
│   ├── auto-draft/                 # RSS-based auto-drafting
│   └── polyhedra/                  # 3D rendering
├── prisma/
│   ├── schema.prisma               # SQLite (dev)
│   └── schema.postgresql.prisma    # PostgreSQL (prod)
├── scripts/                        # Build / dev helpers (incl. ensure-autoblogger.mjs)
├── plans/                          # Roadmap.md + tmp/ drafts
└── server.js                       # Custom server with ready signal for zero-downtime deploys
```

## Autoblogger integration

Source: `"autoblogger": "github:hrosenblume/autoblogger"` in package.json. The package ships prebuilt `dist/`, so `bun install` is the only step needed — no build, no symlink.

### What autoblogger provides

- **AI**: `generate()`, `buildGeneratePrompt()`, `buildAutoDraftPrompt()`, `parseGeneratedContent()`, `resolveModel()`
- **Chat / Dashboard**: `ChatProvider`, `useChatContext()`, `ChatPanel`, `useKeyboard`, `AutobloggerDashboard`
- **CMS API**: `cms.handleRequest()` (internal/session-auth) + `cms.handlePublicRequest()` (public/bearer-auth)
- **Markdown**: `renderMarkdown()`, `markdownToHtml()`, `htmlToMarkdown()`, `wordCount()`, `generateSlug()`

### Mount points (in this app)

- `app/api/cms/[...path]/route.ts` → `cms.handleRequest(req, path)` — dashboard API
- `app/(dashboard)/writer/api/[...path]/route.ts` → `cms.handlePublicRequest(req, path)` — public API at `/writer/api/v1/*`
- `app/(dashboard)/writer/[[...path]]/page.tsx` → `<AutobloggerDashboard />` — dashboard UI

### Refreshing the package

When autoblogger ships a new version on GitHub:

```bash
bun update autoblogger        # refreshes bun.lock to the latest commit hash
```

Don't use yalc unless explicitly debugging. If a yalc symlink ever creeps in, restore with `yalc remove autoblogger && bun install`. Never use `yalc add` (writes `file:.yalc/...` to package.json which breaks production installs).

## Imports cheat sheet

```typescript
// AI + utilities (server-safe)
import { generate, resolveModel, buildAutoDraftPrompt, parseGeneratedContent } from 'autoblogger'
import { wordCount, generateSlug, renderMarkdown } from 'autoblogger'

// UI components and hooks
import { useKeyboard, ChatProvider, useChatContext, ChatPanel } from 'autoblogger/ui'
```

## Database schema

Source of truth: `prisma/schema.prisma` (SQLite for dev, mirrored in `schema.postgresql.prisma` for prod).

Key models: `Post`, `Revision`, `Comment`, `User`, `Tag`, `PostTag`, `AISettings`, `IntegrationSettings`, `TopicSubscription`, `NewsItem`, **`ApiKey`**, **`ApiAuditLog`** (the last two power the autoblogger public API; required by `/v1/*` endpoints).

`Post` has the standard autoblogger fields plus a host-only `polyhedraShape` and includes `previewToken` / `previewExpiry` for the public API's preview-link endpoint.

## Code style

### TypeScript

- Strict mode; avoid `any`. Use path aliases `@/lib/*`, `@/components/*`, `@/app/*`.

### React / Next

- Server Components by default; `'use client'` only when hooks/interactivity are needed.
- Use `useCallback` / `useMemo` for performance in client components.
- Async Server Components for data fetching.

### Components

- Functional only.
- Page-specific stays in route `_components/` folders; truly shared lives in top-level `components/`.
- Check `components/ui/` (shadcn) before creating new UI components.

### Styling

- Tailwind only. Use `cn()` from `@/lib/utils/cn`.
- Dark mode: `dark:` (host's standard).
- **Never** use raw Tailwind font sizes (`text-sm`, `text-lg`) — use the custom scale: `text-title`, `text-h1`, `text-h2`, `text-h3`, `text-section`, `text-body`, `text-table`.
- Touch: use `TapLink`, `overscroll-contain` on scrollable containers, `touch-none` on fixed elements, support `prefers-reduced-motion`.

### DRY checkpoints

| Need | Location |
|---|---|
| Homepage content | `lib/homepage.ts` |
| Admin nav items | `lib/admin-nav.ts` |
| Keyboard shortcuts | `lib/keyboard/shortcuts.ts` |
| Editor constants | `lib/editor/constants.ts` |
| Post CRUD logic | `lib/posts.ts` |
| SVG icons | `components/Icons.tsx` |
| Integrations config | `lib/integrations/config.ts` |

Never hardcode author name, email, or bio. Never define keyboard shortcuts inline.

### API routes

- JSON responses; proper HTTP status codes.
- Wrap with `withSession()` / `withAdmin()` from `@/lib/auth`.

### Database

- Singleton Prisma client from `@/lib/db`.
- Queries in Server Components or API routes.

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Dev server (`next dev --turbopack`) |
| `bun run dev:tunnel` | Dev + ngrok (mobile testing) |
| `bun run build:prod` | Production build (PostgreSQL) |
| `bun run db:push` | Push schema (SQLite) |
| `bun run db:push:prod` | Push schema (PostgreSQL) |
| `bun run typecheck` | TS only |

`next.config.js` lists `serverExternalPackages: ['jsdom', 'parse5']` — required because autoblogger's optional URL-extractor uses jsdom which transitively requires the ESM-only parse5.

## Environment variables

```env
DATABASE_URL="file:./dev.db"
DATABASE_URL_PROD="postgresql://..."
NEXTAUTH_SECRET="<random>"
GOOGLE_CLIENT_ID="<id>"
GOOGLE_CLIENT_SECRET="<secret>"
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

## Git workflow

Production releases land via PR + auto-merge — not direct push to main.

1. `git checkout -b chore/<short-description>` (or `feat/...`, `fix/...`).
2. Make changes; `bun run typecheck`.
3. `git add` — never `.env.local`, `.env.local.save`, `*.bak`.
4. Commit; push branch.
5. `gh pr create`; `gh pr merge --auto --squash --delete-branch`.

`dev` branch promotion (legacy from cursor rules) is no longer the workflow — straight to PR off main now.

## Common gotchas

- **Hydration mismatches** — Use `immediatelyRender: false` for Tiptap.
- **Origin always ahead** — If CI bumps versions automatically and you push without bumping locally, origin gets ahead. Pull/rebase before pushing.
- **autoblogger's parse5 / jsdom** — Don't statically import `autoblogger/.../url-extractor`. Stay on `await import()` paths; trust the package's lazy loading. Host-side, keep `serverExternalPackages: ['jsdom', 'parse5']` in `next.config.js`.
- **Symlinks under Next 16** — Don't symlink `autoblogger` from a sibling repo. Webpack/Turbopack don't reliably follow it. Always install from GitHub via `bun update autoblogger`.

## Planning files

`plans/Roadmap.md` — Now / Soon / Later. `plans/tmp/` — drafts (gitignored).

When the user mentions a bug, feature, or improvement they want but don't implement now, capture it in the Roadmap (Soon for bugs, Later for ideas).
