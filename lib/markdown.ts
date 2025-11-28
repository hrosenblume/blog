import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
})

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

