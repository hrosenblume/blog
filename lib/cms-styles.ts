// Client-safe styles for autoblogger dashboard
// Separated from lib/cms.ts to avoid importing server-only modules

export const cmsStyles = {
  container: 'max-w-[680px] mx-auto px-6',
  title: 'text-title font-bold',
  subtitle: 'text-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  prose: 'prose dark:prose-invert max-w-none',
}
