// Site-specific settings navigation (blog-specific, not CMS)
// CMS settings (users, posts, tags, AI, topics) are now in /writer/settings via autoblogger

export type AdminNavItem = {
  label: string
  href: string
  countKey?: string  // optional for settings pages
  featureFlag?: 'autoDraftEnabled'  // only show when this feature is enabled
}

// Site-specific settings only - CMS stuff is in autoblogger (/writer/settings)
export const adminNavItems: AdminNavItem[] = [
  { label: 'Visits', href: '/settings/leads/visits', countKey: 'visits' },
  { label: 'Companies', href: '/settings/visitors/companies', countKey: 'companies' },
  { label: 'Persons', href: '/settings/visitors/persons', countKey: 'persons' },
  { label: 'SEO', href: '/settings/seo' },
  { label: 'Integrations', href: '/settings/integrations' },
]

// For navbar grouping - items listed here will appear in dropdowns
export const adminNavGroups = [
  { label: 'Analytics', items: ['Visits', 'Companies', 'Persons'] },
  { label: 'Settings', items: ['SEO', 'Integrations'] },
]

// Items not in any group (shown as direct links in navbar)
export const adminDirectLinks: string[] = []

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



