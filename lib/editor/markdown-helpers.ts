/**
 * Helper functions for markdown mode in the editor toolbar.
 * Handles cursor-based text manipulation in textareas.
 */

/**
 * Insert text before and after the current selection in a textarea.
 * Used for inline formatting like bold (**), italic (*), code (`), etc.
 */
export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = markdown.substring(start, end)
  const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end)
  onMarkdownChange(newText)
  
  // Restore focus and selection after React re-render
  requestAnimationFrame(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selected.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

/**
 * Insert or toggle a block prefix at the start of the current line.
 * Used for lists (- ), blockquotes (> ), etc.
 */
export function insertBlockAtCursor(
  textarea: HTMLTextAreaElement,
  prefix: string,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Find the start of the current line
  let lineStart = start
  while (lineStart > 0 && markdown[lineStart - 1] !== '\n') {
    lineStart--
  }
  
  // Get current line content
  let lineEnd = end
  while (lineEnd < markdown.length && markdown[lineEnd] !== '\n') {
    lineEnd++
  }
  const lineContent = markdown.substring(lineStart, lineEnd)
  
  // Check if already has prefix, toggle off
  if (lineContent.startsWith(prefix)) {
    const newText = markdown.substring(0, lineStart) + lineContent.substring(prefix.length) + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  } else {
    const newText = markdown.substring(0, lineStart) + prefix + lineContent + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  }
  
  requestAnimationFrame(() => {
    textarea.focus()
  })
}

/**
 * Set or toggle a heading level on the current line.
 * Replaces any existing heading prefix with the new level.
 */
export function setHeadingAtCursor(
  textarea: HTMLTextAreaElement,
  level: number,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Find the start of the current line
  let lineStart = start
  while (lineStart > 0 && markdown[lineStart - 1] !== '\n') {
    lineStart--
  }
  
  // Get current line content
  let lineEnd = end
  while (lineEnd < markdown.length && markdown[lineEnd] !== '\n') {
    lineEnd++
  }
  const lineContent = markdown.substring(lineStart, lineEnd)
  
  // Remove any existing heading prefix
  const withoutHeading = lineContent.replace(/^#{1,6}\s*/, '')
  const newPrefix = '#'.repeat(level) + ' '
  
  // If the line already has this exact heading level, toggle it off
  const currentHeadingMatch = lineContent.match(/^(#{1,6})\s/)
  if (currentHeadingMatch && currentHeadingMatch[1].length === level) {
    // Toggle off - remove heading
    const newText = markdown.substring(0, lineStart) + withoutHeading + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  } else {
    // Set new heading level
    const newText = markdown.substring(0, lineStart) + newPrefix + withoutHeading + markdown.substring(lineEnd)
    onMarkdownChange(newText)
  }
  
  requestAnimationFrame(() => {
    textarea.focus()
  })
}

/**
 * Strip common markdown syntax from selected text.
 * Removes bold, italic, strikethrough, code, and links.
 */
export function clearMarkdownFormatting(
  textarea: HTMLTextAreaElement,
  markdown: string,
  onMarkdownChange: (md: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  if (start === end) return // No selection
  
  const selected = markdown.substring(start, end)
  const cleaned = selected
    .replace(/\*\*(.+?)\*\*/g, '$1')  // bold
    .replace(/\*(.+?)\*/g, '$1')      // italic
    .replace(/~~(.+?)~~/g, '$1')      // strikethrough
    .replace(/`(.+?)`/g, '$1')        // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
  
  const newText = markdown.substring(0, start) + cleaned + markdown.substring(end)
  onMarkdownChange(newText)
  
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(start, start + cleaned.length)
  })
}










