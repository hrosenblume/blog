# Essay Editor: Hide Word Count

## Goal
Remove or hide the word count display from the essay editor to reduce mental clutter during writing.

## Current Behavior
- Word count is displayed somewhere in the editor UI
- May cause anxiety or distraction while writing
- Not essential for the writing experience

## Investigation Needed
Locate where word count is displayed:
- Check `app/writer/editor/[[...slug]]/page.tsx`
- Check `components/editor/EditorToolbar.tsx`
- Check `components/editor/EditorNavbar.tsx`
- Check `components/TiptapEditor.tsx`

## Proposed Solutions

### Option A: Remove Completely
Simply remove the word count display:

```tsx
// Before
<div className="flex items-center gap-4">
  <span className="text-sm text-gray-500">{wordCount} words</span>
  <Button>Save</Button>
</div>

// After
<div className="flex items-center gap-4">
  <Button>Save</Button>
</div>
```

### Option B: Hide Behind Toggle (Preserve Option)
Keep the feature but hide by default:

```tsx
const [showWordCount, setShowWordCount] = useState(false)

// In UI
{showWordCount && (
  <span className="text-sm text-gray-500">{wordCount} words</span>
)}

// Toggle button (subtle)
<button 
  onClick={() => setShowWordCount(!showWordCount)}
  className="text-gray-400 hover:text-gray-600"
  title={showWordCount ? 'Hide word count' : 'Show word count'}
>
  <WordCountIcon className="w-4 h-4" />
</button>
```

### Option C: Move to Hover/Tooltip
Show word count only on hover over a subtle indicator:

```tsx
<div className="group relative">
  <span className="text-gray-400 cursor-help">ℹ</span>
  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded">
    {wordCount} words
  </div>
</div>
```

### Option D: Move to Editor Settings/Info Panel
If there's an info or settings panel, move word count there:

```tsx
// In a collapsible info panel
<details className="text-sm text-gray-500">
  <summary>Document Info</summary>
  <ul>
    <li>Words: {wordCount}</li>
    <li>Characters: {charCount}</li>
    <li>Reading time: ~{Math.ceil(wordCount / 200)} min</li>
  </ul>
</details>
```

## Recommended Approach
**Option A (Remove Completely)** is simplest and aligns with the goal of reducing clutter. Word count can always be added back if needed.

## Files to Modify
- Likely `components/editor/EditorToolbar.tsx` or `components/editor/EditorNavbar.tsx`
- Or `app/writer/editor/[[...slug]]/page.tsx` if inline

## Testing Checklist
- [ ] Word count no longer visible in editor
- [ ] No layout issues from removal
- [ ] Editor still functions correctly
- [ ] No console errors

## Future Considerations
- Could add word count to post metadata in admin view
- Could show on save confirmation ("Saved 1,234 words")
- Reading time estimate might be more useful on published page

