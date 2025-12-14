/**
 * SEO-configurable static pages
 * 
 * Add new pages here to make them appear in the SEO admin dashboard.
 * Each page's generateMetadata should call getPageSettings(id) to get its SEO values.
 */

export type SeoPage = {
  id: string          // Unique identifier (used as DB primary key)
  path: string        // URL path
  name: string        // Display name in admin
  description: string // Help text in admin
}

/**
 * All static pages that can have custom SEO settings.
 * Add new entries here when creating new static pages.
 */
export const seoPages: SeoPage[] = [
  {
    id: 'home',
    path: '/',
    name: 'Homepage',
    description: 'The main landing page',
  },
  {
    id: 'essays',
    path: '/essays',
    name: 'Essays',
    description: 'The essays listing page',
  },
]

/**
 * Get a page config by its ID
 */
export function getSeoPageById(id: string): SeoPage | undefined {
  return seoPages.find(p => p.id === id)
}

/**
 * Get a page config by its path
 */
export function getSeoPageByPath(path: string): SeoPage | undefined {
  return seoPages.find(p => p.path === path)
}
