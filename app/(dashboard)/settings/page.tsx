import { prisma } from '@/lib/db'
import Link from 'next/link'
import { adminNavItems, filterByFeatureFlags } from '@/lib/admin-nav'
import { getAdminCounts } from '@/lib/admin'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

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
    getAdminCounts(),
    getFeatureFlags(),
  ])

  const visibleItems = filterByFeatureFlags(adminNavItems, featureFlags)

  return (
    <div className="mt-4">
      <h2 className="text-section font-semibold pb-4 mb-6 border-b border-border">Settings</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="p-4 sm:p-6 hover:bg-accent transition-colors">
              <p className="text-table sm:text-body text-muted-foreground">{item.label}</p>
              {item.countKey ? (
                <p className="text-h1 sm:text-title font-bold mt-1 sm:mt-2">{counts[item.countKey] ?? 0}</p>
              ) : (
                <p className="text-body text-muted-foreground mt-1 sm:mt-2">Configure →</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

