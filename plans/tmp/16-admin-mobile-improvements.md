# Admin Doesn't Work on Mobile

## Goal
Make the admin interface usable on mobile devices, either through responsive improvements or a separate mobile-optimized approach.

## Current Issues
- Tables don't fit on mobile screens
- Touch targets too small
- Complex forms hard to use
- Navigation may be broken

## Options

### Option A: Responsive Admin UI
Adapt current admin for mobile with responsive design.

### Option B: Separate Mobile Admin
Build a simplified mobile-specific admin interface.

### Option C: Progressive Web App (PWA)
Create a PWA for mobile admin access.

### Option D: Accept Desktop-Only
Document that admin is desktop-only (simplest).

## Recommended: Option A - Responsive Admin

### 1. Responsive Tables

Convert tables to card layout on mobile:

```tsx
// Desktop: Table
<div className="hidden md:block">
  <Table>...</Table>
</div>

// Mobile: Cards
<div className="md:hidden space-y-4">
  {items.map(item => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-500">{item.status}</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm">Edit</Button>
        <Button size="sm" variant="destructive">Delete</Button>
      </div>
    </div>
  ))}
</div>
```

### 2. Mobile Navigation

Add hamburger menu for admin nav:

```tsx
// components/admin/MobileNav.tsx
'use client'
import { useState } from 'react'

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)}>
        <MenuIcon />
      </button>
      {isOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white shadow-lg">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/users">Users</Link>
        </nav>
      )}
    </div>
  )
}
```

### 3. Touch-Friendly Forms

Increase input sizes and spacing:

```tsx
<input 
  className="w-full p-4 text-base rounded-lg" // Larger padding, base font size
/>
```

### 4. Simplified Mobile Actions

Use bottom sheet for actions instead of dropdowns:

```tsx
// On mobile, show action sheet
<Sheet>
  <SheetTrigger>Actions</SheetTrigger>
  <SheetContent side="bottom">
    <Button className="w-full mb-2">Edit</Button>
    <Button className="w-full mb-2">Duplicate</Button>
    <Button className="w-full" variant="destructive">Delete</Button>
  </SheetContent>
</Sheet>
```

## Files to Modify
- `app/admin/layout.tsx` - Add mobile nav
- `app/admin/posts/page.tsx` - Responsive table/cards
- `app/admin/users/page.tsx` - Responsive table/cards
- `components/admin/*` - Mobile-friendly components

## Testing Checklist
- [ ] Admin pages load on mobile
- [ ] Navigation works on mobile
- [ ] Can view list of posts
- [ ] Can edit a post
- [ ] Can manage users
- [ ] Touch targets are adequate (44x44px)
- [ ] Forms are usable
- [ ] No horizontal scroll

## Minimum Viable Mobile Admin
If full responsive is too much work:
1. Make navigation work
2. Make post list viewable (cards)
3. Make post editing work
4. Accept that user management is desktop-only

