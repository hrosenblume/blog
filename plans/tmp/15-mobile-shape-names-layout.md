# Mobile: Regen Shapes with Long Names Breaks Layout

## Goal
Fix layout issues when polyhedra with long names are displayed on mobile devices.

## Problem
- Some shape names are very long (e.g., "Pentagonal Hexecontahedron")
- On mobile, these names overflow or break the layout
- May cause horizontal scroll or text overlap

## Investigation Needed
- Find where shape names are displayed
- Check current text handling/truncation
- Identify specific breakpoints where issues occur

## Solutions

### Option A: Truncate Long Names

```tsx
// Truncate with ellipsis
<span className="truncate max-w-[150px] md:max-w-none">
  {shapeName}
</span>
```

### Option B: Responsive Font Size

```tsx
<span className="text-xs md:text-sm">
  {shapeName}
</span>
```

### Option C: Hide Name on Mobile

```tsx
<span className="hidden md:inline">
  {shapeName}
</span>
```

### Option D: Wrap Text

```tsx
<span className="break-words hyphens-auto">
  {shapeName}
</span>
```

### Option E: Abbreviate Long Names

Create a mapping for long names:
```tsx
const abbreviations: Record<string, string> = {
  'Pentagonal Hexecontahedron': 'P. Hexecontahedron',
  'Rhombicosidodecahedron': 'Rhombicosidod.',
}

const displayName = abbreviations[shapeName] || shapeName
```

## Recommended Approach
Use **Option A (Truncate)** with tooltip for full name:

```tsx
<span 
  className="truncate max-w-[120px] md:max-w-none"
  title={shapeName}
>
  {shapeName}
</span>
```

## Files to Modify
- Component displaying shape names (likely in admin or regen UI)
- `components/PolyhedraCanvas.tsx` if name is shown there

## Testing Checklist
- [ ] Long shape names don't break layout on iPhone
- [ ] Long shape names don't break layout on Android
- [ ] Full name visible on hover/tap (tooltip)
- [ ] Desktop layout unchanged
- [ ] No horizontal scroll on mobile

