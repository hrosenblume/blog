// Server-only count resolvers for admin dashboard
// Add new countKey resolvers here when adding nav items with counts

import { prisma } from '@/lib/db'
import { adminNavItems } from '@/lib/admin-nav'

// Map countKey to Prisma query function
const countResolvers: Record<string, () => Promise<number>> = {
  users: () => prisma.user.count(),
  posts: () => prisma.post.count(),
  tags: () => prisma.tag.count(),
  revisions: () => prisma.revision.count(),
  visits: () => prisma.lead.count(),
  topics: () => prisma.topicSubscription.count(),
  companies: async () => {
    const result = await prisma.lead.findMany({
      where: { company: { not: null } },
      select: { company: true },
      distinct: ['company'],
    })
    return result.length
  },
  persons: () => prisma.lead.count({
    where: {
      OR: [
        { email: { not: null } },
        { firstName: { not: null } },
      ],
    },
  }),
}

// Fetch all counts for nav items that have countKeys
export async function getAdminCounts(): Promise<Record<string, number>> {
  const keysNeeded = adminNavItems
    .filter(item => item.countKey)
    .map(item => item.countKey!)

  const entries = await Promise.all(
    keysNeeded.map(async key => {
      const resolver = countResolvers[key]
      if (!resolver) {
        console.warn(`Missing count resolver for key: ${key}`)
        return [key, 0] as const
      }
      return [key, await resolver()] as const
    })
  )

  return Object.fromEntries(entries)
}
