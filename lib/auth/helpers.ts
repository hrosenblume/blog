// Client-safe auth helpers
// These can be imported in 'use client' components without bundling Prisma

/**
 * Check if user can publish (admin or writer, not drafter)
 */
export function canPublish(role: string | undefined): boolean {
  return role === 'admin' || role === 'writer'
}
