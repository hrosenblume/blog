export const SHORTCUTS = {
  THEME_TOGGLE: { key: '.', meta: true, allowInInput: true },
  TOGGLE_VIEW: { key: '/', meta: true, allowInInput: true },  // essay↔editor, home↔writer
  SETTINGS: { key: ';', meta: true, allowInInput: true },  // toggle to/from /settings
  CHAT_TOGGLE: { key: 'k', meta: true, allowInInput: true },  // open/close chat panel
  NEW_ARTICLE: { key: 'n' },
  PREV: { key: 'ArrowLeft' },
  NEXT: { key: 'ArrowRight' },
  ESCAPE_BACK: { key: 'Escape', allowInInput: true },  // editor→writer
  TOGGLE_CHAT_MODE: { key: 'a', meta: true, shift: true, allowInInput: true },  // Ask↔Agent mode
} as const
