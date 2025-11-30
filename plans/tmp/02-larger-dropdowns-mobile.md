# Larger Dropdowns on Mobile

## Goal
Improve touch targets for dropdown menus on mobile devices, making them easier to tap and interact with.

## Current Behavior
- Dropdown items sized for desktop (mouse precision)
- Small touch targets lead to mis-taps on mobile
- May violate accessibility guidelines (44x44px minimum)

## Proposed Solution

### 1. Audit Current Dropdown Component
Check `components/Dropdown.tsx` for current sizing:

```tsx
// Current (likely)
<button className="px-3 py-2 text-sm ...">
  {item.label}
</button>
```

### 2. Responsive Padding Increase
Use Tailwind responsive prefixes to increase touch targets on mobile:

```tsx
// Updated with mobile-first responsive sizing
<button className="px-4 py-3 md:px-3 md:py-2 text-body md:text-sm ...">
  {item.label}
</button>
```

### 3. Minimum Touch Target Size
Ensure all interactive elements meet 44x44px minimum:

```tsx
// In Dropdown.tsx
const dropdownItemClass = cn(
  // Base mobile styles (larger)
  'min-h-[44px] px-4 py-3 text-body',
  // Desktop styles (can be smaller)
  'md:min-h-0 md:px-3 md:py-2 md:text-sm',
  // Common styles
  'w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800'
)
```

### 4. Dropdown Menu Width
Consider wider dropdown on mobile for easier reading:

```tsx
<div className={cn(
  'absolute z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg',
  // Wider on mobile
  'min-w-[200px] md:min-w-[160px]'
)}>
  {items}
</div>
```

### 5. Add to Shared Styles
If dropdown styles are used elsewhere, add to `lib/styles.ts`:

```tsx
export const dropdownItemClass = 'min-h-[44px] px-4 py-3 md:min-h-0 md:px-3 md:py-2 ...'
export const dropdownMenuClass = 'min-w-[200px] md:min-w-[160px] ...'
```

## Files to Modify
- `components/Dropdown.tsx` - Primary dropdown component
- `lib/styles.ts` - If adding shared classes
- Any other components using dropdown patterns

## Testing Checklist
- [ ] Dropdown items are easy to tap on iPhone
- [ ] Dropdown items are easy to tap on Android
- [ ] No layout issues on desktop
- [ ] Dropdown still looks good visually
- [ ] Touch targets meet 44x44px minimum
- [ ] Test in both portrait and landscape

## Accessibility Notes
- WCAG 2.1 Success Criterion 2.5.5 recommends 44x44 CSS pixels
- Larger targets benefit users with motor impairments
- Consider adding `:focus-visible` ring for keyboard users

