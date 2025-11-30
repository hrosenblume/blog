import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Pagination } from '@/components/admin/Pagination'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function RevisionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [revisions, totalCount] = await Promise.all([
    prisma.revision.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
      include: { post: { select: { title: true, slug: true, markdown: true } } },
    }),
    prisma.revision.count(),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
        isCurrent ? (
          <Badge key="status" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
            Current
          </Badge>
        ) : (
          <Badge key="status" variant="secondary">Past</Badge>
        ),
      ],
      actions: (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/revisions/${revision.id}`}>View</Link>
        </Button>
      ),
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-bold">Revisions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total revision{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/revisions" position="top" />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No revisions yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/revisions" position="bottom" />
    </div>
  )
}
