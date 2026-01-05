// Shared admin navigation configuration
// Adding items here will automatically show them in the navbar and dashboard

export type AdminNavItem = {
  label: string
  href: string
  countKey?: string  // optional for settings pages
  featureFlag?: 'autoDraftEnabled'  // only show when this feature is enabled
}

export const adminNavItems: AdminNavItem[] = [
  { label: 'Users', href: '/settings/users', countKey: 'users' },
  { label: 'Posts', href: '/settings/posts', countKey: 'posts' },
  { label: 'Tags', href: '/settings/tags', countKey: 'tags' },
  { label: 'Comments', href: '/settings/comments', countKey: 'comments' },
  { label: 'Revisions', href: '/settings/revisions', countKey: 'revisions' },
  { label: 'Visits', href: '/settings/leads/visits', countKey: 'visits' },
  { label: 'Companies', href: '/settings/visitors/companies', countKey: 'companies' },
  { label: 'Persons', href: '/settings/visitors/persons', countKey: 'persons' },
  { label: 'Topics', href: '/settings/topics', countKey: 'topics', featureFlag: 'autoDraftEnabled' },
  { label: 'AI', href: '/settings/ai' },
  { label: 'SEO', href: '/settings/seo' },
  { label: 'Integrations', href: '/settings/integrations' },
]

// For navbar grouping - items listed here will appear in dropdowns
export const adminNavGroups = [
  { label: 'Content', items: ['Posts', 'Tags', 'Comments', 'Revisions', 'Topics'] },
  { label: 'Analytics', items: ['Visits', 'Companies', 'Persons'] },
  { label: 'Settings', items: ['AI', 'SEO', 'Integrations'] },
]

// Items not in any group (shown as direct links in navbar)
export const adminDirectLinks = ['Users']

// Helper to get nav items for a group
export function getGroupItems(groupLabel: string): AdminNavItem[] {
  const group = adminNavGroups.find(g => g.label === groupLabel)
  if (!group) return []
  return group.items
    .map(label => adminNavItems.find(item => item.label === label))
    .filter((item): item is AdminNavItem => item !== undefined)
}

// Helper to get direct link items
export function getDirectLinkItems(): AdminNavItem[] {
  return adminDirectLinks
    .map(label => adminNavItems.find(item => item.label === label))
    .filter((item): item is AdminNavItem => item !== undefined)
}

// Filter items based on feature flags
export function filterByFeatureFlags(
  items: AdminNavItem[],
  enabledFlags: Record<string, boolean>
): AdminNavItem[] {
  return items.filter(item => {
    if (!item.featureFlag) return true
    return enabledFlags[item.featureFlag] === true
  })
}



