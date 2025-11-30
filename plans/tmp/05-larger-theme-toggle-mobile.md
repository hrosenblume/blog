# Make Light/Dark Button in Footer Larger on Mobile

## Goal
Increase the touch target size of the theme toggle button in the footer for better mobile usability.

## Current Behavior
- Theme toggle button sized for desktop
- Small touch target on mobile
- May be difficult to tap accurately

## Investigation Needed
Locate the theme toggle:
- Check `components/ThemeToggle.tsx`
- Check `components/HomepageFooter.tsx` for usage
- Check any other footer components

## Proposed Solution

### 1. Responsive Sizing in ThemeToggle Component

```tsx
// components/ThemeToggle.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        // Mobile: larger touch target
        'p-3 min-w-[44px] min-h-[44px]',
        // Desktop: can be smaller
        'md:p-2 md:min-w-0 md:min-h-0',
        // Common styles
        'rounded-full',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-colors duration-150'
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 md:w-4 md:h-4" />
      ) : (
        <MoonIcon className="w-5 h-5 md:w-4 md:h-4" />
      )}
    </button>
  )
}
```

### 2. Icon Size Increase
If the button padding is fine but icon is too small:

```tsx
// Responsive icon sizing
<SunIcon className="w-6 h-6 md:w-5 md:h-5" />
```

### 3. Add Visual Feedback
Improve tap feedback on mobile:

```tsx
<button
  className={cn(
    // Touch feedback
    'active:scale-95 active:bg-gray-200 dark:active:bg-gray-700',
    // Other styles...
  )}
>
```

### 4. Consider Position in Footer
If the toggle is cramped in the footer, consider layout adjustments:

```tsx
// In HomepageFooter.tsx
<footer className="flex flex-col md:flex-row items-center gap-4 py-6">
  <div className="flex-1">{/* links */}</div>
  <ThemeToggle /> {/* Standalone, not cramped */}
</footer>
```

## Files to Modify
- `components/ThemeToggle.tsx` - Primary component
- `components/HomepageFooter.tsx` - If layout changes needed

## Testing Checklist
- [ ] Theme toggle is easy to tap on mobile
- [ ] Icon is clearly visible
- [ ] Tap feedback is immediate
- [ ] Desktop appearance is appropriate
- [ ] Touch target meets 44x44px minimum
- [ ] Theme actually toggles on tap

## Accessibility Notes
- Ensure `aria-label` is present and accurate
- Consider `aria-pressed` for toggle state
- Visible focus ring for keyboard users

