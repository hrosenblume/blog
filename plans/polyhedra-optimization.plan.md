# Optimize Polyhedra Loading

## Goal
Reduce homepage bundle by ~53KB by only sending the shapes actually displayed, while keeping all shapes available in the writer for shape selection.

## Current State
- `shapes.json` (~55KB) is imported statically by `PolyhedraCanvas`
- ALL 50+ shapes are bundled to every page, even if only 3-4 are shown
- Writer needs all shapes for the shape dropdown selector

## Approach
Public pages (Server Components) will read `shapes.json` server-side and pass only the needed shape data as serialized props. Writer pages continue importing all shapes.

---

## Files to Modify

### 1. Create shape data types
**File:** `lib/polyhedra/shapes.ts`

Add exported type for shape data:
```typescript
export type ShapeData = { vertices: number[][]; edges: number[][] }
```

### 2. Update PolyhedraCanvas to accept shape data directly
**File:** `components/PolyhedraCanvas.tsx`

Change props to accept either:
- `shapeData` + `shapeName` (for public pages - data passed from server)
- `shape` string (for writer - looks up from imported shapes.json)

```typescript
interface PolyhedraCanvasProps {
  // Option A: Data passed from server (public pages)
  shapeData?: ShapeData
  shapeName?: string  // For edge color seeding
  // Option B: Shape name lookup (writer pages)
  shape?: string
  // ... rest unchanged
}
```

Use `shapeData` if provided, otherwise fall back to importing and looking up `shape`.

### 3. Update EssayLink to receive shape data
**File:** `components/EssayLink.tsx`

Change `polyhedraShape: string | null` to `shapeData: ShapeData | null` and `shapeName: string | null`.

### 4. Update Homepage to pass shape data
**File:** `app/page.tsx`

Server Component reads shapes.json and maps posts to include shape data:
```typescript
import { SHAPES } from '@/lib/polyhedra/shapes'

const postsWithShapes = posts.map(post => ({
  ...post,
  shapeData: post.polyhedraShape ? SHAPES[post.polyhedraShape] : null,
  shapeName: post.polyhedraShape,
}))
```

### 5. Update Essay page similarly
**File:** `app/e/[slug]/page.tsx`

If essay page shows a polyhedra (it may not currently), pass shape data from server.

### 6. Writer pages unchanged
**Files:** `app/writer/page.tsx`, `app/writer/editor/[[...slug]]/page.tsx`

These already import shapes for the dropdown. They continue using `shape` string prop which triggers client-side lookup. This is fine because:
- Writer is behind auth (not public-facing)
- Shape selector needs all shapes anyway

---

## Result

| Page | Before | After |
|------|--------|-------|
| Homepage (4 posts) | 55KB shapes | ~2KB (4 shapes) |
| Essay page | 55KB shapes | ~0.5KB (1 shape) |
| Writer dashboard | 55KB shapes | 55KB (unchanged, needs all) |

---

## Testing
1. Homepage loads with correct polyhedra
2. Essay pages render polyhedra correctly  
3. Writer shape selector still shows all 50+ shapes
4. Hover acceleration still works
5. Build succeeds with no type errors

---

## Tasks
- [ ] Add ShapeData type export to lib/polyhedra/shapes.ts
- [ ] Update PolyhedraCanvas to accept shapeData prop with fallback to shape lookup
- [ ] Update EssayLink to receive shapeData instead of polyhedraShape string
- [ ] Update app/page.tsx to pass shape data from server
- [ ] Update app/e/[slug]/page.tsx if it uses polyhedra
- [ ] Run build to verify no type errors







