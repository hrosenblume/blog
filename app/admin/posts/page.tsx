import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DeleteButton } from '@/components/DeleteButton'
import { StatusBadge } from '@/components/StatusBadge'
import { tableHeaderClass, tableHeaderRightClass, cellClass, cellPrimaryClass, actionCellClass, linkClass } from '@/lib/styles'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { revisions: true } } }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
        <Link href="/writer/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          New Post
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className={tableHeaderClass}>Title</th>
              <th className={tableHeaderClass}>Slug</th>
              <th className={tableHeaderClass}>Status</th>
              <th className={tableHeaderClass}>Revisions</th>
              <th className={tableHeaderClass}>Updated</th>
              <th className={tableHeaderRightClass}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No posts yet.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className={cellPrimaryClass}>{post.title || 'Untitled'}</td>
                  <td className={`${cellClass} font-mono`}>{post.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={post.status} /></td>
                  <td className={cellClass}>{post._count.revisions}</td>
                  <td className={cellClass}>{new Date(post.updatedAt).toLocaleDateString()}</td>
                  <td className={actionCellClass}>
                    <Link href={`/writer/editor/${post.id}`} className={`${linkClass} mr-4`}>Edit</Link>
                    {post.status === 'published' && (
                      <Link href={`/e/${post.slug}`} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-4" target="_blank">View</Link>
                    )}
                    <DeleteButton endpoint={`/api/posts/${post.id}`} confirmMessage={`Delete "${post.title || 'Untitled'}"? This will also delete all revisions.`} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
