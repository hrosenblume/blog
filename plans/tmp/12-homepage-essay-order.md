# Custom Control Over Homepage Essay Order and Selection

## Goal
Allow manual control over which essays appear on the homepage and in what order, rather than just showing the most recent.

## Current Behavior
- Homepage shows most recent N essays
- Order is determined by `createdAt` or `publishedAt`
- No way to pin, feature, or reorder essays

## Options

### Option A: Featured Flag
Add a "featured" boolean to posts.

### Option B: Sort Order Field
Add a numeric `sortOrder` field for manual ordering.

### Option C: Pinned + Featured
Pin specific essays to top, feature others.

### Option D: Homepage Config Array
Store homepage essay order in a config table.

## Recommended: Option B - Sort Order Field

### 1. Update Database Schema

```prisma
model Post {
  // ... existing fields
  homepageOrder Int? // null = not on homepage, lower = higher priority
}
```

Run migration:
```bash
npx prisma migrate dev --name add-homepage-order
```

### 2. Update Homepage Query

```tsx
// app/page.tsx
const homepageEssays = await prisma.post.findMany({
  where: {
    status: 'published',
    homepageOrder: { not: null }, // Only essays with homepage order
  },
  orderBy: { homepageOrder: 'asc' }, // Lower number = higher priority
  take: homepage.notes.maxItems,
  select: {
    id: true,
    title: true,
    slug: true,
    shape: true,
  },
})

// Fallback to recent if no manual order set
const essays = homepageEssays.length > 0 
  ? homepageEssays 
  : await prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: homepage.notes.maxItems,
      select: { id: true, title: true, slug: true, shape: true },
    })
```

### 3. Admin UI for Ordering

Create `app/admin/homepage/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function HomepageOrderPage() {
  const [essays, setEssays] = useState<Post[]>([])
  const [available, setAvailable] = useState<Post[]>([])

  useEffect(() => {
    // Fetch essays with homepage order
    fetch('/api/admin/homepage')
      .then(res => res.json())
      .then(data => {
        setEssays(data.homepage)
        setAvailable(data.available)
      })
  }, [])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(essays)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)

    setEssays(items)

    // Save new order
    await fetch('/api/admin/homepage', {
      method: 'PUT',
      body: JSON.stringify({ order: items.map(e => e.id) }),
    })
  }

  const addToHomepage = async (essay: Post) => {
    setEssays([...essays, essay])
    setAvailable(available.filter(e => e.id !== essay.id))
    
    await fetch('/api/admin/homepage', {
      method: 'PUT',
      body: JSON.stringify({ order: [...essays, essay].map(e => e.id) }),
    })
  }

  const removeFromHomepage = async (essay: Post) => {
    setEssays(essays.filter(e => e.id !== essay.id))
    setAvailable([...available, essay])
    
    await fetch(`/api/admin/homepage/${essay.id}`, {
      method: 'DELETE',
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-title font-bold mb-8">Homepage Order</h1>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Current homepage essays */}
        <div>
          <h2 className="text-h1 font-semibold mb-4">On Homepage</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="homepage">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {essays.map((essay, index) => (
                    <Draggable key={essay.id} draggableId={essay.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded mb-2 flex justify-between"
                        >
                          <span>{essay.title}</span>
                          <button onClick={() => removeFromHomepage(essay)}>
                            Remove
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        {/* Available essays */}
        <div>
          <h2 className="text-h1 font-semibold mb-4">Available</h2>
          <div className="space-y-2">
            {available.map((essay) => (
              <div 
                key={essay.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded flex justify-between"
              >
                <span>{essay.title}</span>
                <button onClick={() => addToHomepage(essay)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4. Create API Routes

Create `app/api/admin/homepage/route.ts`:

```tsx
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAdmin } from '@/lib/auth'

export const GET = withAdmin(async () => {
  const [homepage, available] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published', homepageOrder: { not: null } },
      orderBy: { homepageOrder: 'asc' },
      select: { id: true, title: true, slug: true },
    }),
    prisma.post.findMany({
      where: { status: 'published', homepageOrder: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true },
    }),
  ])

  return NextResponse.json({ homepage, available })
})

export const PUT = withAdmin(async (request) => {
  const { order } = await request.json()

  // Update all posts with new order
  await prisma.$transaction(
    order.map((id: string, index: number) =>
      prisma.post.update({
        where: { id },
        data: { homepageOrder: index + 1 },
      })
    )
  )

  return NextResponse.json({ success: true })
})
```

### 5. Simpler Alternative: Just Featured Flag

If drag-and-drop is overkill:

```prisma
model Post {
  // ... existing fields
  featured Boolean @default(false)
}
```

```tsx
// Homepage query
const essays = await prisma.post.findMany({
  where: { status: 'published' },
  orderBy: [
    { featured: 'desc' }, // Featured first
    { createdAt: 'desc' }, // Then by date
  ],
  take: homepage.notes.maxItems,
})
```

Add a simple toggle in the editor or admin.

## Files to Create/Modify
- `prisma/schema.prisma` - Add homepageOrder or featured field
- `app/page.tsx` - Update query
- `app/admin/homepage/page.tsx` - Admin UI (if using full ordering)
- `app/api/admin/homepage/route.ts` - API routes
- `app/writer/editor/[[...slug]]/page.tsx` - Add featured toggle (simpler option)

## Dependencies (if using drag-and-drop)
```bash
npm install @hello-pangea/dnd
```

## Testing Checklist
- [ ] Can add essays to homepage
- [ ] Can remove essays from homepage
- [ ] Can reorder essays (if using drag-and-drop)
- [ ] Order persists after page refresh
- [ ] Homepage displays essays in correct order
- [ ] Fallback works when no manual order set
- [ ] Admin-only access enforced

