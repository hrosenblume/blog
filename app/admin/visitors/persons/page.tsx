import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getLeadDisplayName } from '@/lib/leads'
import { Pagination } from '@/components/admin/Pagination'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PersonVisitorsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Get identified persons (have email or name)
  const [leads, totalCount] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { email: { not: null } },
          { firstName: { not: null } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        _count: { select: { visits: true } },
        visits: {
          select: { visitedAt: true },
          orderBy: { visitedAt: 'desc' },
          take: 1,
        },
      },
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const columns = [
    { header: 'Name', maxWidth: 'max-w-[180px]' },
    { header: 'Title', maxWidth: 'max-w-[150px]' },
    { header: 'Company', maxWidth: 'max-w-[150px]' },
    { header: 'Email', maxWidth: 'max-w-[180px]' },
    { header: 'Pages' },
    { header: 'Last Seen' },
  ]

  const rows: AdminTableRow[] = leads.map((lead) => {
    const displayName = getLeadDisplayName(lead)
    const lastSeen = lead.visits[0]?.visitedAt

    return {
      key: lead.id,
      cells: [
        <Link
          key="name"
          href={`/admin/leads/${lead.id}`}
          className="font-medium hover:underline"
        >
          {displayName}
        </Link>,
        <span key="title" className="text-muted-foreground">
          {lead.title || '—'}
        </span>,
        <span key="company" className="text-muted-foreground">
          {lead.company || '—'}
        </span>,
        lead.email ? (
          <a
            key="email"
            href={`mailto:${lead.email}`}
            className="text-blue-500 hover:underline truncate block"
          >
            {lead.email}
          </a>
        ) : (
          <span key="email" className="text-muted-foreground">—</span>
        ),
        <span key="pages" className="text-muted-foreground">{lead._count.visits}</span>,
        <span key="lastSeen" className="text-muted-foreground whitespace-nowrap">
          {lastSeen ? lastSeen.toLocaleDateString() : '—'}
        </span>,
      ],
      mobileTitle: displayName,
      mobileSubtitle: lead.title ? `${lead.title} at ${lead.company || 'Unknown'}` : lead.company,
      mobileMeta: `${lead._count.visits} page${lead._count.visits !== 1 ? 's' : ''} • Last seen ${lastSeen?.toLocaleDateString() || 'never'}`,
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-bold">Person Visitors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} identified visitor{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/visitors/persons" position="top" />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No identified visitors yet."
        showActions={false}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/visitors/persons" position="bottom" />
    </div>
  )
}
