import { prisma } from '@/lib/db'
import { getPaginatedData } from '@/lib/admin'
import Link from 'next/link'
import { Pagination } from '@/components/admin/Pagination'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function RevisionsPage({ searchParams }: PageProps) {
  const { data: revisions, total: totalCount, currentPage, totalPages } = await getPaginatedData(
    searchParams,
    (skip, take) => prisma.revision.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { post: { select: { title: true, slug: true, markdown: true } } },
    }),
    () => prisma.revision.count()
  )

  const columns = [
    { header: 'Post', maxWidth: 'max-w-[200px]' },
    { header: 'Content Preview', maxWidth: 'max-w-[300px]' },
    { header: 'Created' },
    { header: 'Status' },
  ]

  const rows: AdminTableRow[] = revisions.map((revision) => {
    const isCurrent = revision.markdown === revision.post.markdown
    return {
      key: revision.id,
      cells: [
        <Link key="post" href={`/writer/editor/${revision.post.slug}`} className="hover:underline">
          {revision.post.title || 'Untitled'}
        </Link>,
        <span key="preview" className="text-muted-foreground">
          {revision.markdown.slice(0, 80)}{revision.markdown.length > 80 ? '...' : ''}
        </span>,
        <span key="created" className="text-muted-foreground">{new Date(revision.createdAt).toLocaleString()}</span>,
        <Badge key="status" variant={isCurrent ? 'default' : 'secondary'}>{isCurrent ? 'current' : 'past'}</Badge>,
      ],
      actions: (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/settings/revisions/${revision.id}`}>View</Link>
        </Button>
      ),
      mobileLabel: revision.post.title || 'Untitled',
      mobileBadge: <Badge variant={isCurrent ? 'default' : 'secondary'}>{isCurrent ? 'current' : 'past'}</Badge>,
      mobileMeta: `${revision.markdown.slice(0, 40)}${revision.markdown.length > 40 ? '...' : ''} · ${new Date(revision.createdAt).toLocaleDateString()}`,
    }
  })

  return (
    <div>
      <AdminPageHeader
        title="Revisions"
        subtitle={`${totalCount} total revision${totalCount !== 1 ? 's' : ''}`}
        action={<Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/revisions" position="top" />}
      />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No revisions yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/revisions" position="bottom" />
    </div>
  )
}
