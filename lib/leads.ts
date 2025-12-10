/**
 * Lead utility functions
 */

export function getLeadDisplayName(lead: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}): string {
  if (lead.firstName && lead.lastName) return `${lead.firstName} ${lead.lastName}`
  return lead.email || 'Anonymous'
}
