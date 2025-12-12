import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * Render markdown to sanitized HTML (for server-side rendering of essays)
 */
export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown) as string
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'target', 'rel'],
    },
  })
}

/**
 * Convert markdown to HTML without sanitization (for Tiptap editor which handles its own sanitization)
 * This is safe to use client-side since Tiptap sanitizes content internally.
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { gfm: true, breaks: true }) as string
}

// Calculate word count from markdown
export function wordCount(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
}
