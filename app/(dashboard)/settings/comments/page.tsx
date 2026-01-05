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

export default async function CommentsPage({ searchParams }: PageProps) {
  const { data: comments, total: totalCount, currentPage, totalPages } = await getPaginatedData(
    searchParams,
    (skip, take) => prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        post: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    () => prisma.comment.count()
  )

  const columns = [
    { header: 'Post', maxWidth: 'max-w-[200px]' },
    { header: 'Author' },
    { header: 'Comment', maxWidth: 'max-w-[300px]' },
    { header: 'Created' },
    { header: 'Status' },
  ]

  const rows: AdminTableRow[] = comments.map((comment) => {
    const isDeleted = comment.deletedAt !== null
    const isResolved = comment.resolved
    const isReply = comment.parentId !== null

    // For replies, link to parent comment; for top-level, link to this comment
    const commentIdToOpen = comment.parentId || comment.id

    return {
      key: comment.id,
      cells: [
        <Link key="post" href={`/writer/editor/${comment.post.slug}`} className="hover:underline">
          {comment.post.title || 'Untitled'}
        </Link>,
        <span key="author" className="text-muted-foreground">
          {comment.user.name || comment.user.email}
        </span>,
        <span key="content" className="text-muted-foreground">
          {isReply && <span className="text-xs mr-1">↳</span>}
          {comment.content.slice(0, 60)}{comment.content.length > 60 ? '...' : ''}
        </span>,
        <span key="created" className="text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>,
        <span key="status" className="flex gap-1">
          {isDeleted && <Badge variant="destructive">deleted</Badge>}
          {isResolved && <Badge variant="secondary">resolved</Badge>}
          {!isDeleted && !isResolved && <Badge variant="default">active</Badge>}
        </span>,
      ],
      actions: (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/writer/editor/${comment.post.slug}?comment=${commentIdToOpen}`}>View</Link>
        </Button>
      ),
      mobileLabel: comment.content.slice(0, 40) + (comment.content.length > 40 ? '...' : ''),
      mobileBadge: isDeleted ? <Badge variant="destructive">deleted</Badge> : isResolved ? <Badge variant="secondary">resolved</Badge> : <Badge variant="default">active</Badge>,
      mobileMeta: `${comment.user.name || comment.user.email} · ${new Date(comment.createdAt).toLocaleDateString()}`,
    }
  })

  return (
    <div>
      <AdminPageHeader
        title="Comments"
        subtitle={`${totalCount} total comment${totalCount !== 1 ? 's' : ''}`}
        action={<Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/comments" position="top" />}
      />

      <AdminTable
        columns={columns}
        rows={rows}
        emptyMessage="No comments yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/settings/comments" position="bottom" />
    </div>
  )
}

