import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Pagination } from '@/components/admin/Pagination'
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

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Post</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {revisions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No revisions yet.
                </td>
              </tr>
            ) : (
              revisions.map((revision) => {
                const isCurrent = revision.markdown === revision.post.markdown
                return (
                  <tr key={revision.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/writer/editor/${revision.post.slug}`} className="hover:underline">
                        {revision.post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">
                      {revision.markdown.slice(0, 80)}{revision.markdown.length > 80 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(revision.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCurrent ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
                          Current
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Past</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/revisions/${revision.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/revisions" position="bottom" />
    </div>
  )
}
