import TurndownService from 'turndown'

const turndown = new TurndownService({
  headingStyle: 'atx',      // Use # style headings
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  bulletListMarker: '-',
})

// Keep line breaks as <br> tags convert to newlines
turndown.addRule('lineBreaks', {
  filter: 'br',
  replacement: () => '\n',
})

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html)
}

