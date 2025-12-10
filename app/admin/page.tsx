import { prisma } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [userCount, postCount, revisionCount, leadCount, visitCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.revision.count(),
    prisma.lead.count(),
    prisma.leadVisit.count(),
  ])

  const stats = [
    { name: 'Users', count: userCount, href: '/admin/users', color: 'bg-blue-500' },
    { name: 'Posts', count: postCount, href: '/admin/posts', color: 'bg-green-500' },
    { name: 'Revisions', count: revisionCount, href: '/admin/revisions', color: 'bg-purple-500' },
    { name: 'Leads', count: leadCount, href: '/admin/leads', color: 'bg-orange-500' },
    { name: 'Visits', count: visitCount, href: '/admin/leads/visits', color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-section font-bold text-gray-900 dark:text-white mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{stat.count}</span>
              </div>
              <div>
                <h2 className="text-section font-semibold text-gray-900 dark:text-white">
                  {stat.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage {stat.name.toLowerCase()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

