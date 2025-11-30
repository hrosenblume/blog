# "View All Essays" Link

## Goal
Add a "View all essays" link on the homepage (and optionally on each essay page) to provide easy navigation to a complete essay listing.

## Current Behavior
- Homepage shows limited recent essays
- No way to see all published essays
- Users must navigate essay-by-essay

## Options

### Option A: Link to Dedicated Essays Page
Create a new `/essays` page listing all essays.

### Option B: Expand Homepage
Add a "Show all" toggle on the homepage.

### Option C: Both
Link to essays page AND have expandable homepage.

## Recommended: Option A - Dedicated Essays Page

### 1. Create Essays Listing Page

Create `app/essays/page.tsx`:

```tsx
import prisma from '@/lib/db'
import { EssayLink } from '@/components/EssayLink'
import { homepage } from '@/lib/homepage'

export const metadata = {
  title: 'All Essays',
  description: `All essays by ${homepage.name}`,
}

export default async function EssaysPage() {
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      shape: true,
      createdAt: true,
    },
  })

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-title font-bold mb-8">All Essays</h1>
      
      {essays.length === 0 ? (
        <p className="text-gray-500">No essays published yet.</p>
      ) : (
        <div className="space-y-6">
          {essays.map((essay) => (
            <EssayLink key={essay.id} essay={essay} />
          ))}
        </div>
      )}
      
      <div className="mt-12">
        <a 
          href="/" 
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to home
        </a>
      </div>
    </main>
  )
}
```

### 2. Add Link to Homepage

Update `app/page.tsx`:

```tsx
// After the recent essays section
<section>
  <h2 className="text-section font-semibold mb-4">
    {homepage.notes.title}
  </h2>
  
  <div className="space-y-4">
    {recentEssays.map((essay) => (
      <EssayLink key={essay.id} essay={essay} />
    ))}
  </div>
  
  {/* Add this link */}
  {totalEssays > homepage.notes.maxItems && (
    <div className="mt-6">
      <Link 
        href="/essays"
        className="text-body text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        View all {totalEssays} essays →
      </Link>
    </div>
  )}
</section>
```

### 3. Update Homepage Data Fetching

```tsx
// In app/page.tsx
const [recentEssays, totalEssays] = await Promise.all([
  prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    take: homepage.notes.maxItems,
    select: { id: true, title: true, slug: true, shape: true },
  }),
  prisma.post.count({
    where: { status: 'published' },
  }),
])
```

### 4. Add Link to Essay Pages (Optional)

Update `app/e/[slug]/page.tsx`:

```tsx
// In the navigation area
<nav className="flex justify-between items-center mb-8">
  <Link href="/">Home</Link>
  <Link href="/essays" className="text-gray-500 hover:text-gray-900">
    All Essays
  </Link>
</nav>
```

### 5. Update Homepage Config

Add to `lib/homepage.ts`:

```tsx
export const homepage = {
  // ... existing config
  notes: {
    title: 'Recent Essays',
    maxItems: 5,
    emptyMessage: 'No essays yet.',
    viewAllText: 'View all essays →', // Add this
  },
}
```

### 6. Alternative: Grouped by Year

For a more organized listing:

```tsx
// Group essays by year
const essaysByYear = essays.reduce((acc, essay) => {
  const year = new Date(essay.createdAt).getFullYear()
  if (!acc[year]) acc[year] = []
  acc[year].push(essay)
  return acc
}, {} as Record<number, typeof essays>)

// Render
{Object.entries(essaysByYear)
  .sort(([a], [b]) => Number(b) - Number(a))
  .map(([year, yearEssays]) => (
    <section key={year}>
      <h2 className="text-h1 font-semibold mb-4">{year}</h2>
      <div className="space-y-4">
        {yearEssays.map((essay) => (
          <EssayLink key={essay.id} essay={essay} />
        ))}
      </div>
    </section>
  ))}
```

## Files to Create/Modify
- `app/essays/page.tsx` - New essays listing page
- `app/page.tsx` - Add "View all" link
- `app/e/[slug]/page.tsx` - Optional nav link
- `lib/homepage.ts` - Add viewAllText config

## Testing Checklist
- [ ] Essays page lists all published essays
- [ ] Essays are sorted by date (newest first)
- [ ] "View all" link appears on homepage when essays exceed maxItems
- [ ] Link works correctly
- [ ] Page is responsive
- [ ] Dark mode works
- [ ] Empty state handled gracefully

## Design Considerations
- Keep styling consistent with homepage
- Consider pagination if many essays (unlikely for personal blog)
- Mobile-friendly layout
- Clear visual hierarchy

