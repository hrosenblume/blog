import { prisma } from '@/lib/db'
import { getLeadDisplayName } from '@/lib/leads'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { Field } from '@/components/admin/Field'

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { visitedAt: 'desc' },
      },
    },
  })

  if (!lead) return notFound()

  const displayName = getLeadDisplayName(lead)

  // Visits table
  const visitColumns = [
    { header: 'Date' },
    { header: 'Page', maxWidth: 'max-w-[250px]' },
    { header: 'Referrer', maxWidth: 'max-w-[200px]' },
  ]

  const visitRows: AdminTableRow[] = lead.visits.map((visit) => ({
    key: visit.id,
    cells: [
      <span key="date" className="whitespace-nowrap">
        {new Date(visit.visitedAt).toLocaleString()}
      </span>,
      <span key="page" className="text-muted-foreground truncate block">
        {visit.pageUrl || '—'}
      </span>,
      <span key="referrer" className="text-muted-foreground truncate block">
        {visit.referrer || '—'}
      </span>,
    ],
    mobileTitle: new Date(visit.visitedAt).toLocaleString(),
    mobileSubtitle: visit.pageUrl || 'Unknown page',
  }))

  return (
    <div>
      <BackLink href="/admin/leads" label="Leads" />

      <h1 className="text-section font-bold mb-6">{displayName}</h1>

      {/* Lead Details */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" value={lead.email} />
          <Field label="LinkedIn" value={lead.linkedIn} link />
          <Field label="Company" value={lead.company} />
          <Field label="Website" value={lead.companyUrl} link />
          <Field label="Title" value={lead.title} />
          <Field label="Industry" value={lead.industry} />
          <Field label="Employees" value={lead.employees} />
          <Field label="First Seen" value={lead.createdAt.toLocaleString()} />
          <Field label="Last Updated" value={lead.updatedAt.toLocaleString()} />
        </div>
      </div>

      {/* Visit History */}
      <div className="mb-8">
        <h2 className="font-semibold mb-4">
          Visit History ({lead.visits.length} visit{lead.visits.length === 1 ? '' : 's'})
        </h2>
        <AdminTable
          columns={visitColumns}
          rows={visitRows}
          emptyMessage="No visits recorded."
          showActions={false}
        />
      </div>

      {/* Raw Payload (first visit only for debugging) */}
      {lead.visits[0]?.rawPayload && (
        <details className="bg-muted rounded-lg p-4">
          <summary className="cursor-pointer text-muted-foreground text-sm font-medium">
            Raw Payload (latest visit)
          </summary>
          <pre className="mt-4 text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(JSON.parse(lead.visits[0].rawPayload), null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
