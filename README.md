# Personal Essay Blog

A clean, minimal blog with a writer dashboard. Built with Next.js, Prisma, and NextAuth.

## Features

- Markdown editor with live preview
- Google OAuth authentication (single user)
- Admin dashboard for user/post management
- Dark mode support
- Static site generation for public pages
- Image uploads

## Quick Start

```bash
npm install
cp .env.example .env   # Edit with your credentials
npx prisma db push
npm run dev
```

- Public site: http://localhost:3000
- Writer dashboard: http://localhost:3000/writer
- Admin panel: http://localhost:3000/admin

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WRITER_EMAIL="your-email@gmail.com"
# NGROK_AUTHTOKEN="your-ngrok-authtoken"  # Optional, for mobile testing
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

## Project Structure

```
blog/
├── app/
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard (protected)
│   ├── auth/         # Auth pages
│   ├── e/[slug]/     # Essay pages (SSG)
│   ├── writer/       # Writer dashboard (protected)
│   └── page.tsx      # Homepage (SSG)
├── components/       # Shared UI components
├── lib/
│   ├── auth.ts       # NextAuth config
│   ├── db.ts         # Prisma client
│   ├── markdown.ts   # Markdown utils
│   └── utils/        # Utility functions
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Seed script
├── public/
│   └── uploads/      # Uploaded images
```

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: SQLite + Prisma
- **Auth**: NextAuth.js (Google)
- **Styling**: Tailwind CSS
