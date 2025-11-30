import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DeleteButton } from '@/components/DeleteButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/admin/Pagination'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { revisions: true } } },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.post.count(),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-section font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total post{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/writer/editor">New Post</Link>
        </Button>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/posts" position="top" />

      {posts.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
          No posts yet.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Revisions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{post.title || 'Untitled'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{post.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={post.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{post._count.revisions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/writer/editor/${post.slug}`}>Edit</Link>
                      </Button>
                      {post.status === 'published' && (
                        <Button variant="ghost" size="sm" asChild className="text-green-600 hover:text-green-700">
                          <Link href={`/e/${post.slug}`} target="_blank">View</Link>
                        </Button>
                      )}
                      <DeleteButton endpoint={`/api/posts/${post.id}`} confirmMessage={`Delete "${post.title || 'Untitled'}"? This will also delete all revisions.`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{post.title || 'Untitled'}</p>
                    <p className="text-sm text-muted-foreground font-mono truncate">{post.slug}</p>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {post._count.revisions} revision{post._count.revisions !== 1 ? 's' : ''} · Updated {new Date(post.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/writer/editor/${post.slug}`}>Edit</Link>
                  </Button>
                  {post.status === 'published' && (
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/e/${post.slug}`} target="_blank">View</Link>
                    </Button>
                  )}
                  <DeleteButton endpoint={`/api/posts/${post.id}`} confirmMessage={`Delete "${post.title || 'Untitled'}"?`} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/posts" position="bottom" />
    </div>
  )
}
