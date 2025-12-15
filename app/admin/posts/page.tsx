import { prisma } from '@/lib/db'
import { getPaginatedData } from '@/lib/admin'
import Link from 'next/link'
import { Pagination } from '@/components/admin/Pagination'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableRow } from '@/components/admin/AdminTable'
import { SimpleActionsMenu } from '@/components/admin/AdminActionsMenu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { data: posts, total: totalCount, currentPage, totalPages } = await getPaginatedData(
    searchParams,
    (skip, take) => prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { revisions: true } } },
      skip,
      take,
    }),
    () => prisma.post.count()
  )

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
      <SimpleActionsMenu
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
      <AdminPageHeader
        title="Posts"
        subtitle={`${totalCount} total post${totalCount !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/posts" position="top" />
            <Button asChild>
              <Link href="/writer/editor">New Post</Link>
            </Button>
          </div>
        }
      />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No posts yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/posts" position="bottom" />
    </div>
  )
}
