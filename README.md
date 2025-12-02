# hunter.blog

A personal essay site with a writer's dashboard. [Live site →](https://hunterrosenblume.com)

---

## What You Get

- Rich text editor with markdown support
- Post revisions and image uploads
- Writer dashboard + admin panel
- Keyboard shortcuts throughout
- Dark/light mode, static generation

## Stack

- Next.js 15 / React 19
- Prisma (SQLite dev, PostgreSQL prod)
- NextAuth v5 (Google OAuth)
- Tiptap editor
- Tailwind CSS

## Quick Start

```bash
git clone https://github.com/hrosenblume/blog
cd blog
cp .env.example .env.local  # fill in your values
npm install && npm run db:setup && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

See `.env.example` for all options. Key variables:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WRITER_EMAIL="you@example.com"
WRITER_NAME="Your Name"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/essays` | All essays |
| `/e/[slug]` | Single essay |
| `/writer` | Writer dashboard |
| `/admin` | Admin panel |

---

Fork it, make it yours.
