# Blog (Next.js)

A simple, clean blog with a writer dashboard. Built with Next.js, Prisma, and NextAuth.

## Features

- 📝 Markdown editor with live preview
- 🔐 Google OAuth authentication (single user)
- 📊 Dashboard with post stats
- 🌙 Dark mode support
- ⚡ Static site generation for public pages
- 📱 Responsive design

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google OAuth credentials

# Initialize database
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/writer](http://localhost:3000/writer) for the dashboard.

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WRITER_EMAIL="your-email@gmail.com"
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Import posts from Django |

## Migrating from Django

If you have existing posts in the Django version:

```bash
# Make sure the Django db.sqlite3 is in the parent directory
npm run db:seed
```

## Project Structure

```
blog-js/
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Auth pages
│   ├── e/[slug]/     # Essay pages (SSG)
│   ├── writer/       # Dashboard (protected)
│   └── page.tsx      # Homepage (SSG)
├── lib/
│   ├── auth.ts       # NextAuth config
│   ├── db.ts         # Prisma client
│   └── markdown.ts   # Markdown utils
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Migration script
└── public/
    └── uploads/      # Uploaded images
```

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: SQLite + Prisma
- **Auth**: NextAuth.js (Google)
- **Styling**: Tailwind CSS
- **Theme**: next-themes


