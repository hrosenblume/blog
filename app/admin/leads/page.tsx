import { prisma } from '@/lib/db'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { AdminActionsMenu } from '@/components/admin/AdminActionsMenu'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { visits: true } },
    },
  })

  const columns = [
    { header: 'Contact', maxWidth: 'max-w-[200px]' },
    { header: 'Company', maxWidth: 'max-w-[150px]' },
    { header: 'Title', maxWidth: 'max-w-[150px]' },
    { header: 'Visits' },
    { header: 'First Seen' },
  ]

  const rows: AdminTableRow[] = leads.map((lead) => ({
    key: lead.id,
    cells: [
      <div key="contact">
        <div className="font-medium">
          {lead.firstName && lead.lastName
            ? `${lead.firstName} ${lead.lastName}`
            : lead.email || 'Anonymous'}
        </div>
        {lead.email && (
          <div className="text-sm text-muted-foreground truncate">{lead.email}</div>
        )}
      </div>,
      <span key="company" className="text-muted-foreground">{lead.company || '—'}</span>,
      <span key="title" className="text-muted-foreground">{lead.title || '—'}</span>,
      <span key="visits" className="text-muted-foreground">{lead._count.visits}</span>,
      <span key="date" className="text-muted-foreground">
        {new Date(lead.createdAt).toLocaleDateString()}
      </span>,
    ],
    actions: (
      <AdminActionsMenu
        editHref={`/admin/leads/${lead.id}`}
        deleteEndpoint={`/api/admin/leads/${lead.id}`}
        deleteConfirmMessage={`Delete lead "${lead.email || 'Anonymous'}" and all their visits?`}
      />
    ),
    mobileTitle: lead.firstName ? `${lead.firstName} ${lead.lastName}` : (lead.email || 'Anonymous'),
    mobileSubtitle: lead.company || lead.email,
    mobileMeta: `${lead._count.visits} visit${lead._count.visits === 1 ? '' : 's'} • First seen ${new Date(lead.createdAt).toLocaleDateString()}`,
    mobileActions: (
      <AdminActionsMenu
        editHref={`/admin/leads/${lead.id}`}
        deleteEndpoint={`/api/admin/leads/${lead.id}`}
        deleteConfirmMessage={`Delete lead "${lead.email || 'Anonymous'}" and all their visits?`}
      />
    ),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-section font-bold">Leads</h1>
        <span className="text-muted-foreground">{leads.length} lead{leads.length === 1 ? '' : 's'}</span>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No leads captured yet. Configure RB2B to start tracking visitors."
      />
    </div>
  )
}
