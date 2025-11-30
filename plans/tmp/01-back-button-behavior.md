# Back Button Behavior & Unsaved Changes

## Goal
Prevent users from accidentally losing unsaved changes when navigating away from draft essays in the editor.

## Current Behavior
- No warning when navigating away from unsaved changes
- Back button immediately leaves the page
- Users can lose work unexpectedly

## Proposed Solution

### 1. Track Dirty State
Add state tracking in the editor to detect unsaved changes:

```tsx
// In editor page component
const [isDirty, setIsDirty] = useState(false)
const [lastSavedContent, setLastSavedContent] = useState('')

// Update dirty state when content changes
useEffect(() => {
  setIsDirty(content !== lastSavedContent)
}, [content, lastSavedContent])

// Clear dirty state after save
const handleSave = async () => {
  await savePost()
  setLastSavedContent(content)
  setIsDirty(false)
}
```

### 2. Browser Navigation Warning
Use `beforeunload` event to warn on browser back/refresh:

```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault()
      e.returnValue = '' // Required for Chrome
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [isDirty])
```

### 3. Next.js Router Navigation Warning
Intercept Next.js router navigation:

```tsx
import { useRouter } from 'next/navigation'

// Option A: Use router.beforePopState (if available)
// Option B: Custom confirmation modal before navigation

const router = useRouter()

const handleNavigation = (path: string) => {
  if (isDirty) {
    const confirmed = window.confirm('You have unsaved changes. Leave anyway?')
    if (!confirmed) return
  }
  router.push(path)
}
```

### 4. Custom Confirmation Modal (Better UX)
Replace browser confirm with styled modal:

```tsx
// components/UnsavedChangesModal.tsx
export function UnsavedChangesModal({ 
  isOpen, 
  onSave, 
  onDiscard, 
  onCancel 
}: Props) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <h2>Unsaved Changes</h2>
        <p>You have unsaved changes. What would you like to do?</p>
        <div className="flex gap-3">
          <Button onClick={onSave}>Save & Leave</Button>
          <Button variant="secondary" onClick={onDiscard}>Discard</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Files to Modify
- `app/writer/editor/[[...slug]]/page.tsx` - Add dirty state tracking
- `components/editor/EditorNavbar.tsx` - Update navigation handlers
- Create `components/UnsavedChangesModal.tsx` (optional)

## Testing Checklist
- [ ] Warning appears when clicking back with unsaved changes
- [ ] Warning appears when refreshing with unsaved changes
- [ ] Warning appears when clicking nav links with unsaved changes
- [ ] No warning when content is saved
- [ ] Save & Leave correctly saves before navigating
- [ ] Discard correctly navigates without saving
- [ ] Cancel keeps user on page

## Edge Cases
- Auto-save could reduce the need for this (consider implementing)
- New drafts vs editing existing posts
- Empty drafts should not trigger warning

