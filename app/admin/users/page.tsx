import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DeleteButton } from '@/components/DeleteButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-section font-bold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">Add User</Link>
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
          No users yet. Add one to get started.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.role} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton endpoint={`/api/admin/users/${user.id}`} confirmMessage={`Delete user "${user.email}"?`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-card rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.name || 'No name'}</p>
                  </div>
                  <StatusBadge status={user.role} />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Created {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" asChild className="flex-1">
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                  <DeleteButton endpoint={`/api/admin/users/${user.id}`} confirmMessage={`Delete user "${user.email}"?`} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
