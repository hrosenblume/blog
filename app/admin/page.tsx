import { prisma } from '@/lib/db'
import Link from 'next/link'
import { adminNavItems, filterByFeatureFlags } from '@/lib/admin-nav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

// Fetch counts for each nav item based on countKey
async function getCounts(): Promise<Record<string, number>> {
  const [userCount, postCount, revisionCount, visitCount, companies, personCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.revision.count(),
    prisma.lead.count(),
    prisma.lead.findMany({
      where: { company: { not: null } },
      select: { company: true },
      distinct: ['company'],
    }),
    prisma.lead.count({
      where: {
        OR: [
          { email: { not: null } },
          { firstName: { not: null } },
        ],
      },
    }),
  ])

  return {
    users: userCount,
    posts: postCount,
    revisions: revisionCount,
    visits: visitCount,
    companies: companies.length,
    persons: personCount,
  }
}

// Fetch feature flags for conditional nav items
async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' },
  }) as { autoDraftEnabled?: boolean } | null

  return {
    autoDraftEnabled: settings?.autoDraftEnabled ?? false,
  }
}

export default async function AdminDashboard() {
  const [counts, featureFlags] = await Promise.all([
    getCounts(),
    getFeatureFlags(),
  ])

  const visibleItems = filterByFeatureFlags(adminNavItems, featureFlags)

  return (
    <div>
      <h1 className="text-title font-semibold mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.countKey ? (
                  <p className="text-3xl font-bold">{counts[item.countKey] ?? 0}</p>
                ) : (
                  <p className="text-muted-foreground">Configure →</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
