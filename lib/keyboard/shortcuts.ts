export const SHORTCUTS = {
  THEME_TOGGLE: { key: '.', meta: true, allowInInput: true },
  TOGGLE_VIEW: { key: '/', meta: true, allowInInput: true },  // essay↔editor, home↔writer
  ADMIN: { key: "'", meta: true, allowInInput: true },  // go to admin dashboard
  NEW_ARTICLE: { key: 'n' },
  PREV: { key: 'ArrowLeft' },
  NEXT: { key: 'ArrowRight' },
  ESCAPE_BACK: { key: 'Escape', allowInInput: true },  // editor→writer
} as const
