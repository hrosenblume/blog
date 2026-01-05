import { prisma } from '@/lib/db'
import { parsePaginationParams, paginateArray } from '@/lib/admin'
import { getLeadDisplayName } from '@/lib/leads'
import { Pagination } from '@/components/admin/Pagination'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { LinkedInIcon } from '@/components/Icons'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PersonVisitorsPage({ searchParams }: PageProps) {
  const { currentPage } = await parsePaginationParams(searchParams)

  // Get identified persons (have email or name)
  // Fetch all to sort by last visit, then paginate
  const allLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { email: { not: null } },
        { firstName: { not: null } },
      ],
    },
    include: {
      _count: { select: { visits: true } },
      visits: {
        select: { visitedAt: true },
        orderBy: { visitedAt: 'desc' },
        take: 1,
      },
    },
  })

  // Sort by last seen (most recent first)
  const sortedLeads = allLeads.sort((a, b) => {
    const aLastSeen = a.visits[0]?.visitedAt?.getTime() || 0
    const bLastSeen = b.visits[0]?.visitedAt?.getTime() || 0
    return bLastSeen - aLastSeen
  })

  // Paginate after sorting
  const { items: leads, total: totalCount, totalPages } = paginateArray(sortedLeads, currentPage)

  const columns = [
    { header: 'Name' },
    { header: 'Company' },
    { header: 'Email', maxWidth: 'max-w-[180px]' },
    { header: 'LI', className: 'w-10' },
    { header: 'Pages', className: 'w-16' },
    { header: 'Last Seen' },
  ]

  const rows: AdminTableRow[] = leads.map((lead) => {
    const displayName = getLeadDisplayName(lead)
    const lastSeen = lead.visits[0]?.visitedAt

    // Mobile actions: email + LinkedIn links
    const mobileActions = (
      <div className="flex items-center gap-3">
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="text-blue-500 hover:text-blue-600 text-table"
          >
            Email
          </a>
        )}
        {lead.linkedIn && (
          <a
            href={lead.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    )

    return {
      key: lead.id,
      cells: [
        <span key="name" className="font-medium">
          {displayName}
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
        lead.linkedIn ? (
          <a
            key="linkedin"
            href={lead.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
            title={lead.linkedIn}
          >
            <LinkedInIcon />
          </a>
        ) : (
          <span key="linkedin" className="text-muted-foreground">—</span>
        ),
        <span key="pages" className="text-muted-foreground">{lead._count.visits}</span>,
        <span key="lastSeen" className="text-muted-foreground whitespace-nowrap">
          {lastSeen ? lastSeen.toLocaleDateString() : '—'}
        </span>,
      ],
      actions: mobileActions,
      mobileLabel: displayName,
      mobileMeta: `${lead.company || 'Unknown'} · ${lead._count.visits} page${lead._count.visits !== 1 ? 's' : ''} · ${lastSeen?.toLocaleDateString() || 'never'}`,
    }
  })

  return (
    <div>
      <AdminPageHeader
        title="Person Visitors"
        subtitle={`${totalCount} identified visitor${totalCount !== 1 ? 's' : ''}`}
        action={<Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/visitors/persons" position="top" />}
      />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No identified visitors yet."
        showActions={false}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/visitors/persons" position="bottom" />
    </div>
  )
}
