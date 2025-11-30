export const ESSAYS_PAGE = {
  // Metadata
  title: 'All Essays',
  descriptionPrefix: 'All essays by ',

  // Header + navigation
  backLink: {
    href: '/',
    label: '← Home',
  },

  // Recommendation blurb at top of page
  recommendation: {
    intro: 'Not sure which to read? Try ',
    slug: 'p3-startups',
    label: 'P^3 Startups',
  },

  // Empty state when there are no published essays
  emptyMessage: 'No essays published yet.',
} as const


