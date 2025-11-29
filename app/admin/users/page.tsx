import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DeleteButton } from '@/components/DeleteButton'
import { StatusBadge } from '@/components/StatusBadge'
import { tableHeaderClass, tableHeaderRightClass, cellClass, cellPrimaryClass, actionCellClass, linkClass } from '@/lib/styles'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <Link href="/admin/users/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add User
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className={tableHeaderClass}>Email</th>
              <th className={tableHeaderClass}>Name</th>
              <th className={tableHeaderClass}>Role</th>
              <th className={tableHeaderClass}>Created</th>
              <th className={tableHeaderRightClass}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No users yet. Add one to get started.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className={cellPrimaryClass}>{user.email}</td>
                  <td className={cellClass}>{user.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.role} /></td>
                  <td className={cellClass}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className={actionCellClass}>
                    <Link href={`/admin/users/${user.id}`} className={`${linkClass} mr-4`}>Edit</Link>
                    <DeleteButton endpoint={`/api/admin/users/${user.id}`} confirmMessage={`Delete user "${user.email}"?`} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
