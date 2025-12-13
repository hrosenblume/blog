/**
 * Parse AI-generated markdown to extract title, subtitle, and body.
 * 
 * Expects format:
 * # Title
 * *Subtitle*
 * 
 * Body content...
 */
export function parseGeneratedContent(markdown: string): {
  title: string
  subtitle: string
  body: string
} {
  const lines = markdown.trim().split('\n')
  let title = ''
  let subtitle = ''
  let bodyStartIndex = 0

  // Look for H1 title at the start
  if (lines[0]?.startsWith('# ')) {
    title = lines[0].replace(/^#\s+/, '').trim()
    bodyStartIndex = 1
  }

  // Look for italic subtitle (next non-empty line starting with * and ending with *)
  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') continue // skip empty lines

    // Check for italic subtitle: *text* or _text_
    const italicMatch = line.match(/^\*(.+)\*$/) || line.match(/^_(.+)_$/)
    if (italicMatch) {
      subtitle = italicMatch[1].trim()
      bodyStartIndex = i + 1
    }
    break // stop after first non-empty line (whether it's subtitle or not)
  }

  // Skip any leading empty lines after title/subtitle
  while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
    bodyStartIndex++
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim()

  return { title, subtitle, body }
}
