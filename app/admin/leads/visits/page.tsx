import { prisma } from '@/lib/db'
import { getPaginatedData } from '@/lib/admin'
import { getLeadDisplayName } from '@/lib/leads'
import { Pagination } from '@/components/admin/Pagination'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { ViewPayloadButton } from '@/components/admin/ViewPayloadButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function LeadVisitsPage({ searchParams }: PageProps) {
  const { data: visits, total: totalCount, currentPage, totalPages } = await getPaginatedData(
    searchParams,
    (skip, take) => prisma.leadVisit.findMany({
      orderBy: { visitedAt: 'desc' },
      skip,
      take,
      include: { lead: true },
    }),
    () => prisma.leadVisit.count()
  )

  const columns = [
    { header: 'Time' },
    { header: 'Contact', maxWidth: 'max-w-[150px]' },
    { header: 'Company', maxWidth: 'max-w-[120px]' },
    { header: 'Page', maxWidth: 'max-w-[200px]' },
  ]

  const rows: AdminTableRow[] = visits.map((visit) => {
    const contactName = getLeadDisplayName(visit.lead)

    return {
      key: visit.id,
      cells: [
        <span key="time" className="whitespace-nowrap">
          {new Date(visit.visitedAt).toLocaleString()}
        </span>,
        <span key="contact">
          {contactName}
        </span>,
        <span key="company" className="text-muted-foreground">
          {visit.lead.company || '—'}
        </span>,
        <span key="page" className="text-muted-foreground truncate block">
          {visit.pageUrl || '—'}
        </span>,
      ],
      actions: <ViewPayloadButton payload={visit.rawPayload} />,
      mobileLabel: contactName,
      mobileMeta: `${visit.lead.company || 'Unknown'} · ${visit.pageUrl || 'Unknown page'} · ${new Date(visit.visitedAt).toLocaleDateString()}`,
    }
  })

  return (
    <div>
      <AdminPageHeader
        title="Visits"
        subtitle={`${totalCount} total visit${totalCount !== 1 ? 's' : ''}`}
        action={<Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/leads/visits" position="top" />}
      />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No visits recorded yet. Configure RB2B to start tracking."
        showActions={true}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/leads/visits" position="bottom" />
    </div>
  )
}
