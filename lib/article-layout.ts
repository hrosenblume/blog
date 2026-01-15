/**
 * Centralized layout configuration for article pages.
 * 
 * This config ensures the essay page (/e/[slug]) and editor page
 * look identical. Customize these values when reusing this project.
 * 
 * Used by:
 * - components/ArticleLayout.tsx (shared wrapper)
 * - components/ArticleHeader.tsx
 * - components/ArticleBody.tsx
 * - components/TiptapEditor.tsx
 */

// =============================================================================
// CONTAINER
// =============================================================================

/** Max width for article content (essays and editor) */
export const CONTENT_WIDTH = 'max-w-2xl'

/** Horizontal padding for article content */
export const CONTENT_PADDING = 'px-6'

// =============================================================================
// HEADER TYPOGRAPHY
// =============================================================================

/** Title styling (h1 on essay, input on editor) */
export const TITLE_CLASSES = 'text-title font-bold'

/** Subtitle styling (p on essay, input on editor) */
export const SUBTITLE_CLASSES = 'text-lg text-muted-foreground'

/** Byline styling - always underlined for WYSIWYG parity */
export const BYLINE_CLASSES = 'text-sm text-muted-foreground underline'

// =============================================================================
// HEADER SPACING
// =============================================================================

/** Spacing between header elements (title, subtitle) */
export const HEADER_SPACING = 'space-y-2 mb-8'

/** Byline top margin (overrides HEADER_SPACING for more breathing room) */
export const BYLINE_MARGIN = '!mt-4'

// =============================================================================
// INPUT STYLING (Editor mode)
// =============================================================================

/** Shared classes for editable inputs (transparent, borderless) */
export const INPUT_CLASSES = 'w-full bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700'

// =============================================================================
// PROSE / CONTENT BODY
// =============================================================================

/** 
 * Prose classes for article content.
 * Styling handled by autoblogger.css (imported in globals.css)
 */
export const PROSE_CLASSES = 'prose'