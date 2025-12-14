// Barrel exports for lib/editor/

// Hooks
export { usePostEditor } from './usePostEditor'
export { useContentStash } from './useContentStash'

// Types from usePostEditor
export type { 
  PostContent, 
  PostEditorUI, 
  PostEditorNav,
  PostEditorActions,
  UsePostEditorReturn 
} from './usePostEditor'

// Types from types.ts
export type { 
  RevisionSummary, 
  RevisionFull, 
  StashedContent,
  RevisionState,
  AIPreview,
  AIState 
} from './types'

// Markdown helpers
export {
  insertAtCursor,
  insertBlockAtCursor,
  setHeadingAtCursor,
  clearMarkdownFormatting,
} from './markdown-helpers'
