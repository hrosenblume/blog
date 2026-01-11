// Barrel exports for lib/editor/

// Constants
export { DEFAULT_TITLE, EDITOR_PLACEHOLDER } from './constants'

// Hooks
export { usePostEditor } from './usePostEditor'
export { useContentStash } from './useContentStash'
export { useTypeToFocus } from './useTypeToFocus'

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
  AIState,
  GenerationStatus,
} from './types'

// Markdown helpers
export {
  insertAtCursor,
  insertBlockAtCursor,
  setHeadingAtCursor,
  clearMarkdownFormatting,
} from './markdown-helpers'



