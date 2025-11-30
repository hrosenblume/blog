# Switch to shadcn/ui for Admin Components

## Goal
Replace custom admin components with shadcn/ui to reduce boilerplate, ensure consistent styling, and improve maintainability.

## Current State
- Custom components in `components/admin/`
- Manual styling with Tailwind
- Inconsistent patterns across admin pages

## Why shadcn/ui
- Copy-paste components (no npm dependency lock-in)
- Tailwind-based (matches existing stack)
- Accessible by default (Radix UI primitives)
- Highly customizable
- Great for admin dashboards

## Implementation Plan

### Phase 1: Setup shadcn/ui

#### 1.1 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configuration options:
- Style: Default
- Base color: Slate (or Zinc for neutral)
- CSS variables: Yes
- Tailwind CSS: Yes (existing)
- Components directory: `components/ui`
- Utils: Use existing `lib/utils/cn.ts`

#### 1.2 Update tailwind.config.js
shadcn/ui will add its theme extensions. Merge with existing config.

### Phase 2: Install Core Components

```bash
# Tables for admin lists
npx shadcn@latest add table

# Forms
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea

# Feedback
npx shadcn@latest add alert
npx shadcn@latest add toast

# Navigation
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu

# Layout
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add sheet

# Actions
npx shadcn@latest add button
npx shadcn@latest add badge
```

### Phase 3: Migrate Admin Pages

#### 3.1 Admin Posts Table (`app/admin/posts/page.tsx`)

Before:
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className={tableHeaderClass}>Title</th>
      ...
    </tr>
  </thead>
  <tbody>
    {posts.map(post => (
      <tr key={post.id}>
        <td className={cellClass}>{post.title}</td>
        ...
      </tr>
    ))}
  </tbody>
</table>
```

After:
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      ...
    </TableRow>
  </TableHeader>
  <TableBody>
    {posts.map(post => (
      <TableRow key={post.id}>
        <TableCell>{post.title}</TableCell>
        ...
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 3.2 User Form (`components/admin/UserForm.tsx`)

Before:
```tsx
<form onSubmit={handleSubmit}>
  <div>
    <label>Email</label>
    <input 
      type="email" 
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="border rounded px-3 py-2..."
    />
  </div>
  ...
</form>
```

After:
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="writer">Writer</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <Button type="submit">Save User</Button>
  </div>
</form>
```

#### 3.3 Pagination (`components/admin/Pagination.tsx`)

```tsx
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

#### 3.4 Delete Confirmation Dialog

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete User?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Phase 4: Remove Old Components

After migration is complete:
- Delete `components/admin/Pagination.tsx`
- Delete `components/admin/TableEmptyRow.tsx`
- Delete `components/admin/UserForm.tsx`
- Clean up `lib/styles.ts` (remove admin-specific classes)

### Phase 5: Dark Mode Integration

shadcn/ui uses CSS variables for theming. Ensure dark mode works:

```tsx
// In tailwind.config.js, ensure darkMode is set
module.exports = {
  darkMode: 'class',
  // ...
}
```

The shadcn/ui components will automatically respect the dark mode class.

## Files to Modify/Create
- `components.json` - shadcn/ui config (created by init)
- `components/ui/*` - New shadcn components
- `tailwind.config.js` - Theme extensions
- `app/globals.css` - CSS variables for theming
- `app/admin/posts/page.tsx` - Migrate to Table
- `app/admin/users/page.tsx` - Migrate to Table
- `app/admin/users/[id]/page.tsx` - Migrate form
- `app/admin/users/new/page.tsx` - Migrate form
- `components/admin/*` - Eventually delete

## Testing Checklist
- [ ] shadcn/ui initialized correctly
- [ ] Tables render properly
- [ ] Forms work correctly
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Accessibility (keyboard nav, screen readers)
- [ ] No visual regressions in admin pages

## Migration Order
1. Setup shadcn/ui
2. Migrate one page (users list) as proof of concept
3. Migrate remaining pages
4. Remove old components
5. Clean up unused styles

