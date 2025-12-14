# My Personal Website

A personal essay site with AI-powered writing, animated 3D polyhedra, and a full writer's dashboard. [Live site →](https://hunterrosenblume.com)

---

## Features

- **AI Writing** — Generate essays with Claude or GPT-4, brainstorm ideas, rewrite selections
- **Rich Text Editor** — Tiptap WYSIWYG with markdown import/export and auto-save
- **3D Polyhedra** — 50+ animated wireframe shapes rendered on Canvas
- **Post Management** — Drafts, revisions, slug generation, image uploads
- **Lead Tracking** — RB2B integration for visitor identification
- **Analytics** — Google Analytics 4
- **Keyboard-first** — Shortcuts for navigation and editing (`Cmd+.` theme, `Cmd+/` toggle view, arrow keys navigate)
- **Dark/Light Mode** — System preference + manual toggle

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| Auth | NextAuth.js v5 (Google OAuth, allowlist model) |
| Editor | Tiptap |
| AI | Anthropic SDK + OpenAI SDK |
| Styling | Tailwind CSS |
| Images | Local filesystem (dev) / DigitalOcean Spaces (prod) |
| Deploy | GitHub Actions → DigitalOcean Droplet (PM2 cluster) |

## Quick Start

```bash
git clone https://github.com/hrosenblume/blog
cd blog
cp .env.example .env.local  # fill in your values
npm install && npm run db:setup && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all options. Key variables:

```env
# Core
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WRITER_EMAIL="you@example.com"
WRITER_NAME="Your Name"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# AI Writing (at least one required for AI features)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Analytics & Tracking (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_RB2B_API_KEY="..."
RB2B_WEBHOOK_SECRET="..."

# Image Storage - Production only (falls back to local filesystem)
SPACES_REGION="sfo3"
SPACES_BUCKET="your-bucket"
SPACES_ENDPOINT="https://sfo3.digitaloceanspaces.com"
SPACES_CDN_ENDPOINT="https://your-bucket.sfo3.cdn.digitaloceanspaces.com"
SPACES_KEY="..."
SPACES_SECRET="..."
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/essays` | All published essays |
| `/e/[slug]` | Single essay |
| `/writer` | Writer dashboard |
| `/writer/editor` | Create/edit essays |
| `/admin` | Admin dashboard |
| `/admin/ai` | AI writing rules & model settings |
| `/admin/leads` | Lead tracking |
| `/admin/users` | User management |
| `/admin/revisions` | Post revision history |

## Deployment

Push to `main` triggers production deploy via GitHub Actions:

1. SSH into DigitalOcean Droplet
2. Pull latest, install deps, run migrations
3. Build with PostgreSQL schema
4. PM2 zero-downtime restart (cluster mode)

Staging deploys from `dev` branch to a separate instance protected by Cloudflare Access.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build:prod` | Production build (PostgreSQL) |
| `npm run db:push` | Push schema (SQLite) |
| `npm run db:push:prod` | Push schema (PostgreSQL) |
| `npm run db:studio` | Prisma Studio |

---

Fork it, make it yours.
