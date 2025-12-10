import { prisma } from '@/lib/db'
import Link from 'next/link'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'

export const dynamic = 'force-dynamic'

export default async function LeadVisitsPage() {
  const visits = await prisma.leadVisit.findMany({
    orderBy: { visitedAt: 'desc' },
    take: 100,
    include: {
      lead: true,
    },
  })

  const columns = [
    { header: 'Time' },
    { header: 'Contact', maxWidth: 'max-w-[150px]' },
    { header: 'Company', maxWidth: 'max-w-[120px]' },
    { header: 'Page', maxWidth: 'max-w-[200px]' },
    { header: 'IP' },
  ]

  const rows: AdminTableRow[] = visits.map((visit) => {
    const contactName = visit.lead.firstName
      ? `${visit.lead.firstName} ${visit.lead.lastName}`
      : visit.lead.email || 'Anonymous'

    return {
      key: visit.id,
      cells: [
        <span key="time" className="whitespace-nowrap">
          {new Date(visit.visitedAt).toLocaleString()}
        </span>,
        <Link
          key="contact"
          href={`/admin/leads/${visit.lead.id}`}
          className="hover:underline"
        >
          {contactName}
        </Link>,
        <span key="company" className="text-muted-foreground">
          {visit.lead.company || '—'}
        </span>,
        <span key="page" className="text-muted-foreground truncate block">
          {visit.pageUrl || '—'}
        </span>,
        <span key="ip" className="font-mono text-sm text-muted-foreground">
          {visit.ip}
        </span>,
      ],
      mobileTitle: new Date(visit.visitedAt).toLocaleString(),
      mobileSubtitle: contactName,
      mobileMeta: `${visit.lead.company || 'Unknown company'} • ${visit.pageUrl || 'Unknown page'}`,
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-section font-bold">Recent Visits</h1>
        <span className="text-muted-foreground">{visits.length} visit{visits.length === 1 ? '' : 's'}</span>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No visits recorded yet. Configure RB2B to start tracking."
        showActions={false}
      />
    </div>
  )
}
