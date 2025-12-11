import { prisma } from '@/lib/db'
import { getLeadDisplayName } from '@/lib/leads'
import { Pagination } from '@/components/admin/Pagination'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function LeadVisitsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [visits, totalCount] = await Promise.all([
    prisma.leadVisit.findMany({
      orderBy: { visitedAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        lead: true,
      },
    }),
    prisma.leadVisit.count(),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
      mobileTitle: new Date(visit.visitedAt).toLocaleString(),
      mobileSubtitle: contactName,
      mobileMeta: `${visit.lead.company || 'Unknown company'} • ${visit.pageUrl || 'Unknown page'}`,
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-bold">Visits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total visit{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/leads/visits" position="top" />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No visits recorded yet. Configure RB2B to start tracking."
        showActions={false}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/leads/visits" position="bottom" />
    </div>
  )
}
