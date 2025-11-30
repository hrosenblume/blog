# Essay Page Date Format

## Goal
Customize or hide the date display on essay pages. Options include: no date, or a custom format like "written X / posted Y".

## Current Behavior
- Date is displayed on essay pages
- Format may be standard (e.g., "November 30, 2025")
- No distinction between written and published dates

## Options

### Option A: Remove Date Entirely
Clean, timeless essays without dates.

### Option B: Custom "Written/Posted" Format
Show both dates: when written and when published.

### Option C: Configurable Per-Essay
Allow author to choose date display per essay.

### Option D: Relative Dates
"2 weeks ago" instead of absolute dates.

## Implementation

### Option A: Remove Date

Simply remove the date from `app/e/[slug]/page.tsx`:

```tsx
// Before
<time className="text-sm text-gray-500">
  {formatDate(essay.createdAt)}
</time>

// After: just delete the <time> element
```

### Option B: Written/Posted Format

#### 1. Update Database Schema

Add `writtenAt` field to Post model:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  slug      String   @unique
  status    String   @default("draft")
  shape     String?
  writtenAt DateTime? // When the essay was written
  createdAt DateTime @default(now()) // When it was created in system
  updatedAt DateTime @updatedAt
  publishedAt DateTime? // When it was published
}
```

Run migration:
```bash
npx prisma migrate dev --name add-written-at
```

#### 2. Create Date Display Component

```tsx
// components/EssayDate.tsx
import { formatDate } from '@/lib/utils/format'

interface Props {
  writtenAt?: Date | null
  publishedAt?: Date | null
}

export function EssayDate({ writtenAt, publishedAt }: Props) {
  // No dates at all
  if (!writtenAt && !publishedAt) return null
  
  // Only published date
  if (!writtenAt && publishedAt) {
    return (
      <time className="text-sm text-gray-500">
        {formatDate(publishedAt)}
      </time>
    )
  }
  
  // Only written date
  if (writtenAt && !publishedAt) {
    return (
      <time className="text-sm text-gray-500">
        Written {formatDate(writtenAt)}
      </time>
    )
  }
  
  // Both dates
  const sameDay = writtenAt?.toDateString() === publishedAt?.toDateString()
  
  if (sameDay) {
    return (
      <time className="text-sm text-gray-500">
        {formatDate(publishedAt!)}
      </time>
    )
  }
  
  return (
    <div className="text-sm text-gray-500">
      <span>Written {formatDate(writtenAt!)}</span>
      <span className="mx-2">·</span>
      <span>Posted {formatDate(publishedAt!)}</span>
    </div>
  )
}
```

#### 3. Use in Essay Page

```tsx
// app/e/[slug]/page.tsx
import { EssayDate } from '@/components/EssayDate'

export default async function EssayPage({ params }) {
  const essay = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      content: true,
      writtenAt: true,
      publishedAt: true,
    },
  })

  return (
    <article>
      <header>
        <h1>{essay.title}</h1>
        <EssayDate 
          writtenAt={essay.writtenAt} 
          publishedAt={essay.publishedAt} 
        />
      </header>
      {/* content */}
    </article>
  )
}
```

### Option C: Configurable Per-Essay

#### 1. Add Display Option to Schema

```prisma
model Post {
  // ... existing fields
  dateDisplay String @default("published") // "none" | "published" | "written" | "both"
}
```

#### 2. Update Component

```tsx
interface Props {
  writtenAt?: Date | null
  publishedAt?: Date | null
  display: 'none' | 'published' | 'written' | 'both'
}

export function EssayDate({ writtenAt, publishedAt, display }: Props) {
  if (display === 'none') return null
  
  if (display === 'published' && publishedAt) {
    return <time>{formatDate(publishedAt)}</time>
  }
  
  if (display === 'written' && writtenAt) {
    return <time>Written {formatDate(writtenAt)}</time>
  }
  
  if (display === 'both' && writtenAt && publishedAt) {
    return (
      <div>
        Written {formatDate(writtenAt)} · Posted {formatDate(publishedAt)}
      </div>
    )
  }
  
  return null
}
```

#### 3. Add to Editor UI

Add date display selector in editor settings.

### Option D: Relative Dates

```tsx
// lib/utils/format.ts
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
```

## Recommended Approach
Start with **Option A (Remove)** or **Option B (Written/Posted)** based on preference. Option C adds complexity that may not be needed for a personal blog.

## Files to Modify
- `prisma/schema.prisma` - Add writtenAt field (if using Option B/C)
- `app/e/[slug]/page.tsx` - Update date display
- `components/EssayDate.tsx` - Create component (if using Option B/C)
- `lib/utils/format.ts` - Add formatters if needed
- `app/writer/editor/[[...slug]]/page.tsx` - Add date picker (if using Option B/C)

## Testing Checklist
- [ ] Date displays correctly (or is hidden)
- [ ] Written/Posted format shows both dates
- [ ] Same-day handling works
- [ ] Missing dates handled gracefully
- [ ] Timezone handling is correct
- [ ] Mobile layout works

