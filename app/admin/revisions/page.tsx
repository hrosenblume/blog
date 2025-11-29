import { prisma } from '@/lib/db'
import { tableHeaderClass, cellClass, cellPrimaryClass } from '@/lib/styles'

export const dynamic = 'force-dynamic'

export default async function RevisionsPage() {
  const revisions = await prisma.revision.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { post: { select: { title: true, slug: true } } }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revisions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Showing latest 100 revisions</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className={tableHeaderClass}>Post</th>
              <th className={tableHeaderClass}>Revision ID</th>
              <th className={tableHeaderClass}>Content Preview</th>
              <th className={tableHeaderClass}>Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {revisions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No revisions yet.</td>
              </tr>
            ) : (
              revisions.map((revision) => (
                <tr key={revision.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className={cellPrimaryClass}>{revision.post.title || 'Untitled'}</td>
                  <td className={`${cellClass} font-mono`}>{revision.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">{revision.markdown.slice(0, 100)}...</td>
                  <td className={cellClass}>{new Date(revision.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
