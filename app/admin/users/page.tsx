import { prisma } from '@/lib/db'
import Link from 'next/link'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { AdminActionsMenu } from '@/components/admin/AdminActionsMenu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  const columns = [
    { header: 'Email', maxWidth: 'max-w-[250px]' },
    { header: 'Name', maxWidth: 'max-w-[150px]' },
    { header: 'Role' },
    { header: 'Created' },
  ]

  const rows: AdminTableRow[] = users.map((user) => ({
    key: user.id,
    cells: [
      user.email,
      <span key="name" className="text-muted-foreground">{user.name || '—'}</span>,
      <Badge key="role" variant={user.role === 'admin' ? 'default' : user.role === 'drafter' ? 'outline' : 'secondary'}>{user.role}</Badge>,
      <span key="created" className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>,
    ],
    actions: (
      <AdminActionsMenu
        editHref={`/admin/users/${user.id}`}
        deleteEndpoint={`/api/admin/users/${user.id}`}
        deleteConfirmMessage={`Delete user "${user.email}"?`}
      />
    ),
    mobileLabel: user.email,
    mobileBadge: <Badge variant={user.role === 'admin' ? 'default' : user.role === 'drafter' ? 'outline' : 'secondary'}>{user.role}</Badge>,
    mobileMeta: `${user.name || 'No name'} · Created ${new Date(user.createdAt).toLocaleDateString()}`,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-section font-bold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">Add User</Link>
        </Button>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No users yet. Add one to get started."
      />
    </div>
  )
}
