# Essays Should Be in Infinite Loop

## Goal
When navigating past the last essay, wrap around to the first essay (and vice versa). Create a seamless, infinite browsing experience.

## Current Behavior
- Arrow navigation between essays
- Reaching the end stops navigation
- No wrap-around functionality

## Investigation Needed
Check current navigation implementation:
- `app/e/[slug]/_components/KeyboardNav.tsx`
- `components/EssayNav.tsx`
- How prev/next slugs are calculated

## Implementation

### 1. Update Essay Page Data Fetching

```tsx
// app/e/[slug]/page.tsx

async function getAdjacentEssays(currentSlug: string) {
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    select: { slug: true },
  })

  const currentIndex = essays.findIndex(e => e.slug === currentSlug)
  
  if (currentIndex === -1) {
    return { prevSlug: null, nextSlug: null }
  }

  const totalEssays = essays.length

  // Wrap around logic
  const prevIndex = (currentIndex - 1 + totalEssays) % totalEssays
  const nextIndex = (currentIndex + 1) % totalEssays

  return {
    prevSlug: essays[prevIndex]?.slug || null,
    nextSlug: essays[nextIndex]?.slug || null,
    // Optional: indicate if we wrapped
    wrappedPrev: currentIndex === 0,
    wrappedNext: currentIndex === totalEssays - 1,
  }
}

export default async function EssayPage({ params }) {
  const { prevSlug, nextSlug, wrappedPrev, wrappedNext } = await getAdjacentEssays(params.slug)
  
  return (
    <article>
      {/* ... essay content ... */}
      <EssayNav 
        prevSlug={prevSlug} 
        nextSlug={nextSlug}
        wrappedPrev={wrappedPrev}
        wrappedNext={wrappedNext}
      />
    </article>
  )
}
```

### 2. Update EssayNav Component

```tsx
// components/EssayNav.tsx
interface Props {
  prevSlug: string | null
  nextSlug: string | null
  wrappedPrev?: boolean
  wrappedNext?: boolean
}

export function EssayNav({ prevSlug, nextSlug, wrappedPrev, wrappedNext }: Props) {
  return (
    <nav className="flex justify-between items-center py-8 border-t">
      {prevSlug ? (
        <Link 
          href={`/e/${prevSlug}`}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
          title={wrappedPrev ? 'Back to last essay' : 'Previous essay'}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Previous</span>
          {wrappedPrev && (
            <span className="text-xs text-gray-400">(from end)</span>
          )}
        </Link>
      ) : (
        <div /> // Spacer
      )}
      
      {nextSlug ? (
        <Link 
          href={`/e/${nextSlug}`}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
          title={wrappedNext ? 'Continue to first essay' : 'Next essay'}
        >
          <span>Next</span>
          {wrappedNext && (
            <span className="text-xs text-gray-400">(from start)</span>
          )}
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <div /> // Spacer
      )}
    </nav>
  )
}
```

### 3. Update Keyboard Navigation

```tsx
// app/e/[slug]/_components/KeyboardNav.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'

interface Props {
  prevSlug: string | null
  nextSlug: string | null
}

export function KeyboardNav({ prevSlug, nextSlug }: Props) {
  const router = useRouter()

  useKeyboard([
    {
      ...SHORTCUTS.PREV,
      handler: () => {
        if (prevSlug) router.push(`/e/${prevSlug}`)
      },
    },
    {
      ...SHORTCUTS.NEXT,
      handler: () => {
        if (nextSlug) router.push(`/e/${nextSlug}`)
      },
    },
  ])

  return null // This component only handles keyboard events
}
```

### 4. Visual Feedback for Wrap-Around (Optional)

Add subtle visual indication when wrapping:

```tsx
// Animate or highlight when wrapping
const [showWrapIndicator, setShowWrapIndicator] = useState(false)

const handleNext = () => {
  if (wrappedNext) {
    setShowWrapIndicator(true)
    setTimeout(() => setShowWrapIndicator(false), 1000)
  }
  router.push(`/e/${nextSlug}`)
}

// In UI
{showWrapIndicator && (
  <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg animate-fade-in-out">
    Starting from the beginning
  </div>
)}
```

### 5. Handle Single Essay Case

```tsx
// If only one essay, don't show navigation or show disabled state
if (essays.length === 1) {
  return { prevSlug: null, nextSlug: null }
}
```

### 6. Alternative: Circular Reference with Same Essay

If you want to allow navigating "next" from the only essay to return to itself:

```tsx
// For single essay, point to itself
if (essays.length === 1) {
  return { 
    prevSlug: essays[0].slug, 
    nextSlug: essays[0].slug,
    isSingle: true 
  }
}
```

## Files to Modify
- `app/e/[slug]/page.tsx` - Update adjacent essay logic
- `app/e/[slug]/_components/KeyboardNav.tsx` - Ensure keyboard nav uses new slugs
- `components/EssayNav.tsx` - Update to handle wrap indicators

## Testing Checklist
- [ ] From last essay, "Next" goes to first essay
- [ ] From first essay, "Previous" goes to last essay
- [ ] Keyboard navigation (arrows) wraps correctly
- [ ] Single essay case handled (no navigation or self-reference)
- [ ] Two essay case works correctly
- [ ] Visual indication of wrap (optional)
- [ ] No infinite loop bugs in data fetching
- [ ] Performance is acceptable (not re-fetching all essays on each page)

## Edge Cases
- Only 1 published essay
- Only 2 published essays
- Essay becomes unpublished while user is reading
- New essay published while user is browsing

## UX Considerations
- Should we show a subtle indicator when wrapping?
- Should the wrap be seamless or have a small "end of list" message?
- Consider adding a "You've read all essays" message on wrap

