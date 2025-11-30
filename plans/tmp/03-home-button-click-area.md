# Home Button on Essays - Larger Click Area

## Goal
Increase the clickable area of the home button on essay pages for better mobile usability.

## Current Behavior
- Home button likely has minimal padding
- Small click/tap target
- May require precise tapping on mobile

## Investigation Needed
First, locate the home button component:
- Check `app/e/[slug]/page.tsx` for inline home link
- Check `components/EssayNav.tsx` for navigation component
- Check for any header component used on essay pages

## Proposed Solution

### 1. Increase Padding Without Changing Visual Size
Use padding to expand the touch target while keeping the visual appearance:

```tsx
// Before (small target)
<Link href="/" className="text-gray-600 hover:text-gray-900">
  Home
</Link>

// After (larger target with same visual)
<Link 
  href="/" 
  className="px-3 py-2 -mx-3 -my-2 text-gray-600 hover:text-gray-900"
>
  Home
</Link>
```

The negative margins (`-mx-3 -my-2`) offset the padding so the element doesn't take up more visual space.

### 2. Minimum Touch Target Size
Ensure 44x44px minimum for mobile:

```tsx
<Link 
  href="/" 
  className={cn(
    // Expand touch target
    'inline-flex items-center justify-center',
    'min-w-[44px] min-h-[44px]',
    // Visual styling
    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    // Hover background for feedback
    'rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50'
  )}
>
  <span>Home</span>
</Link>
```

### 3. If Using Icon
If the home button is an icon, wrap it with padding:

```tsx
<Link 
  href="/" 
  className="p-3 -m-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
  aria-label="Go to homepage"
>
  <HomeIcon className="w-5 h-5" />
</Link>
```

### 4. Use TapLink Component
Since the project has `TapLink` for iOS scroll detection, consider using it:

```tsx
import { TapLink } from '@/components/TapLink'

<TapLink 
  href="/" 
  className="p-3 -m-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
>
  Home
</TapLink>
```

## Files to Modify
- `app/e/[slug]/page.tsx` - If home link is inline
- `components/EssayNav.tsx` - If home link is in nav component
- Any header component used on essay pages

## Testing Checklist
- [ ] Home button is easy to tap on mobile
- [ ] Visual appearance unchanged or improved
- [ ] Hover state provides feedback
- [ ] Works correctly with TapLink (no scroll/tap confusion)
- [ ] Keyboard accessible with visible focus state
- [ ] Touch target meets 44x44px minimum

## Design Considerations
- Adding subtle hover background improves discoverability
- Negative margins technique preserves layout
- Consider adding subtle transition for hover state

