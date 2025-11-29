import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withAdmin, notFound } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/admin/revisions/[id]/restore - Restore a revision to its post
export const POST = withAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const revision = await prisma.revision.findUnique({
    where: { id: params.id },
    include: { post: true }
  })

  if (!revision) return notFound()

  // Build update data - only include fields that exist in the revision
  const updateData: Record<string, unknown> = {
    markdown: revision.markdown
  }
  
  if (revision.title !== null) {
    updateData.title = revision.title
  }
  if (revision.subtitle !== undefined) {
    updateData.subtitle = revision.subtitle
  }
  if (revision.polyhedraShape !== undefined) {
    updateData.polyhedraShape = revision.polyhedraShape
  }

  // Update the post with the revision's content
  const updatedPost = await prisma.post.update({
    where: { id: revision.postId },
    data: updateData
  })

  // Create a new revision to record this restore action
  await prisma.revision.create({
    data: {
      postId: revision.postId,
      title: updatedPost.title,
      subtitle: updatedPost.subtitle,
      markdown: updatedPost.markdown,
      polyhedraShape: updatedPost.polyhedraShape,
    }
  })

  // Revalidate caches
  revalidatePath('/')
  revalidatePath(`/e/${revision.post.slug}`)

  return NextResponse.json({ success: true })
})

