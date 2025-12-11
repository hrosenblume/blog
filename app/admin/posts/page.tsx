import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Pagination } from '@/components/admin/Pagination'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { AdminActionsMenu } from '@/components/admin/AdminActionsMenu'
import { Badge } from '@/components/ui/badge'
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

  const columns = [
    { header: 'Title', maxWidth: 'max-w-[200px]' },
    { header: 'Slug', maxWidth: 'max-w-[250px]' },
    { header: 'Status' },
    { header: 'Revisions' },
    { header: 'Updated' },
  ]

  const rows: AdminTableRow[] = posts.map((post) => ({
    key: post.id,
    cells: [
      post.title || 'Untitled',
      <span key="slug" className="text-muted-foreground font-mono">{post.slug}</span>,
      <Badge key="status" variant={post.status === 'published' ? 'default' : post.status === 'deleted' ? 'destructive' : 'secondary'}>{post.status}</Badge>,
      <span key="revisions" className="text-muted-foreground">{post._count.revisions}</span>,
      <span key="updated" className="text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</span>,
    ],
    actions: (
      <AdminActionsMenu
        editHref={`/writer/editor/${post.slug}`}
        viewHref={post.status === 'published' ? `/e/${post.slug}` : undefined}
        deleteEndpoint={`/api/posts/${post.id}`}
        deleteConfirmMessage={`Delete "${post.title || 'Untitled'}"? This will also delete all revisions.`}
      />
    ),
    mobileLabel: post.title || 'Untitled',
    mobileBadge: <Badge variant={post.status === 'published' ? 'default' : post.status === 'deleted' ? 'destructive' : 'secondary'}>{post.status}</Badge>,
    mobileMeta: `${post.slug} · ${post._count.revisions} rev · ${new Date(post.updatedAt).toLocaleDateString()}`,
  }))

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

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No posts yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/posts" position="bottom" />
    </div>
  )
}
