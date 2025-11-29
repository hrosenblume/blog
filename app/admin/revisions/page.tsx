import { prisma } from '@/lib/db'
import Link from 'next/link'
import { TableEmptyRow } from '@/components/admin/TableEmptyRow'
import { Pagination } from '@/components/admin/Pagination'
import { tableHeaderClass, tableHeaderRightClass, cellClass, cellPrimaryClass, actionCellClass, linkClass } from '@/lib/styles'

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revisions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount} total revision{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/revisions" position="top" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className={tableHeaderClass}>Post</th>
              <th className={tableHeaderClass}>Content Preview</th>
              <th className={tableHeaderClass}>Created</th>
              <th className={tableHeaderClass}>Status</th>
              <th className={tableHeaderRightClass}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {revisions.length === 0 ? (
              <TableEmptyRow colSpan={5}>No revisions yet.</TableEmptyRow>
            ) : (
              revisions.map((revision) => {
                const isCurrent = revision.markdown === revision.post.markdown
                return (
                  <tr key={revision.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className={cellPrimaryClass}>
                      <Link href={`/writer/editor/${revision.post.slug}`} className="hover:underline">
                        {revision.post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                      {revision.markdown.slice(0, 80)}{revision.markdown.length > 80 ? '...' : ''}
                    </td>
                    <td className={cellClass}>{new Date(revision.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCurrent ? (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                          Current
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          Past
                        </span>
                      )}
                    </td>
                    <td className={actionCellClass}>
                      <Link href={`/admin/revisions/${revision.id}`} className={linkClass}>
                        View
                      </Link>
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
