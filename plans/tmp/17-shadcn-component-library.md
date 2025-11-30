# shadcn/ui for Component Library

## Goal
Adopt shadcn/ui as the component library to simplify development and ensure consistent, accessible components.

## Note
This is related to plan #07 (shadcn for admin). This plan covers broader adoption across the entire app.

## Benefits
- Copy-paste components (no version lock-in)
- Tailwind-based (matches existing stack)
- Accessible by default (Radix primitives)
- Consistent design language
- Reduces custom component maintenance

## Implementation

### 1. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

### 2. Install Common Components

```bash
# Core
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label

# Layout
npx shadcn@latest add card
npx shadcn@latest add separator

# Feedback
npx shadcn@latest add toast
npx shadcn@latest add alert

# Overlay
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet

# Data Display
npx shadcn@latest add badge
npx shadcn@latest add avatar
```

### 3. Migration Strategy

1. **Keep existing components working** - Don't break anything
2. **New features use shadcn** - All new UI uses shadcn
3. **Gradual migration** - Replace old components over time
4. **Delete old components** - Once fully migrated

### 4. Component Mapping

| Current | shadcn Replacement |
|---------|-------------------|
| `Button.tsx` | `ui/button` |
| `Dropdown.tsx` | `ui/dropdown-menu` |
| `DeleteButton.tsx` | `ui/alert-dialog` + `ui/button` |
| `StatusBadge.tsx` | `ui/badge` |
| `Spinner.tsx` | Keep or use loading state |

### 5. Theme Integration

shadcn uses CSS variables. Merge with existing theme:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... shadcn variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode variables */
}
```

## Files to Create/Modify
- `components.json` - shadcn config
- `components/ui/*` - shadcn components
- `tailwind.config.js` - Theme extensions
- `app/globals.css` - CSS variables
- Existing components - Gradual replacement

## Testing Checklist
- [ ] shadcn initialized correctly
- [ ] Components render properly
- [ ] Dark mode works
- [ ] Existing functionality preserved
- [ ] Accessibility maintained

