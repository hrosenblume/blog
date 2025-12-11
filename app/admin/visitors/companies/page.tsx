import { prisma } from '@/lib/db'
import { Pagination } from '@/components/admin/Pagination'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

interface CompanyData {
  company: string
  industry: string | null
  companyUrl: string | null
  visitorCount: number
  totalVisits: number
  lastVisit: Date
}

export default async function CompanyVisitorsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))

  // Get all leads with company info, grouped by company
  const leadsWithCompany = await prisma.lead.findMany({
    where: {
      company: { not: null },
    },
    select: {
      company: true,
      industry: true,
      companyUrl: true,
      _count: { select: { visits: true } },
      visits: {
        select: { visitedAt: true },
        orderBy: { visitedAt: 'desc' },
        take: 1,
      },
    },
  })

  // Aggregate by company
  const companyMap = new Map<string, CompanyData>()
  
  for (const lead of leadsWithCompany) {
    if (!lead.company) continue
    
    const existing = companyMap.get(lead.company)
    const lastVisit = lead.visits[0]?.visitedAt || new Date(0)
    
    if (existing) {
      existing.visitorCount += 1
      existing.totalVisits += lead._count.visits
      if (lastVisit > existing.lastVisit) {
        existing.lastVisit = lastVisit
      }
      // Update industry/url if we have better data
      if (!existing.industry && lead.industry) existing.industry = lead.industry
      if (!existing.companyUrl && lead.companyUrl) existing.companyUrl = lead.companyUrl
    } else {
      companyMap.set(lead.company, {
        company: lead.company,
        industry: lead.industry,
        companyUrl: lead.companyUrl,
        visitorCount: 1,
        totalVisits: lead._count.visits,
        lastVisit,
      })
    }
  }

  // Sort by last visit and paginate
  const allCompanies = Array.from(companyMap.values())
    .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
  
  const totalCount = allCompanies.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const companies = allCompanies.slice(skip, skip + ITEMS_PER_PAGE)

  const columns = [
    { header: 'Company', maxWidth: 'max-w-[200px]' },
    { header: 'Industry', maxWidth: 'max-w-[150px]' },
    { header: 'Website', maxWidth: 'max-w-[150px]' },
    { header: 'Visitors' },
    { header: 'Page Views' },
    { header: 'Last Visit' },
  ]

  const rows: AdminTableRow[] = companies.map((company) => ({
    key: company.company,
    cells: [
      <span key="company" className="font-medium">
        {company.company}
      </span>,
      <span key="industry" className="text-muted-foreground">
        {company.industry || '—'}
      </span>,
      company.companyUrl ? (
        <a
          key="website"
          href={company.companyUrl.startsWith('http') ? company.companyUrl : `https://${company.companyUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate block"
        >
          {company.companyUrl.replace(/^https?:\/\//, '')}
        </a>
      ) : (
        <span key="website" className="text-muted-foreground">—</span>
      ),
      <span key="visitors" className="text-muted-foreground">{company.visitorCount}</span>,
      <span key="views" className="text-muted-foreground">{company.totalVisits}</span>,
      <span key="lastVisit" className="text-muted-foreground whitespace-nowrap">
        {company.lastVisit.getTime() > 0 ? company.lastVisit.toLocaleDateString() : '—'}
      </span>,
    ],
    actions: company.companyUrl ? (
      <a
        href={company.companyUrl.startsWith('http') ? company.companyUrl : `https://${company.companyUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 text-table"
      >
        Website
      </a>
    ) : undefined,
    mobileLabel: company.company,
    mobileMeta: `${company.industry ? company.industry + ' · ' : ''}${company.visitorCount} visitor${company.visitorCount !== 1 ? 's' : ''} · ${company.totalVisits} view${company.totalVisits !== 1 ? 's' : ''}`,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-bold">Company Visitors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} compan{totalCount !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/visitors/companies" position="top" />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No company visitors yet."
        showActions={false}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/visitors/companies" position="bottom" />
    </div>
  )
}
