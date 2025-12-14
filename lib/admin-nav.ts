// Shared admin navigation configuration
// Adding items here will automatically show them in the navbar and dashboard

export type AdminNavItem = {
  label: string
  href: string
  countKey?: string  // optional for settings pages
}

export const adminNavItems: AdminNavItem[] = [
  { label: 'Users', href: '/admin/users', countKey: 'users' },
  { label: 'Posts', href: '/admin/posts', countKey: 'posts' },
  { label: 'Revisions', href: '/admin/revisions', countKey: 'revisions' },
  { label: 'Visits', href: '/admin/leads/visits', countKey: 'visits' },
  { label: 'Companies', href: '/admin/visitors/companies', countKey: 'companies' },
  { label: 'Persons', href: '/admin/visitors/persons', countKey: 'persons' },
  { label: 'AI', href: '/admin/ai' },
  { label: 'SEO', href: '/admin/seo' },
]

// For navbar grouping - items listed here will appear in dropdowns
export const adminNavGroups = [
  { label: 'Content', items: ['Posts', 'Revisions'] },
  { label: 'Analytics', items: ['Visits', 'Companies', 'Persons'] },
  { label: 'Settings', items: ['AI', 'SEO'] },
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

