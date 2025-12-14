import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import { Post } from '@prisma/client'

// Shared types for post operations
interface CreatePostData {
  title: string
  subtitle?: string | null
  slug: string
  markdown?: string
  polyhedraShape?: string | null
  status?: 'draft' | 'published'
  // SEO fields
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  noIndex?: boolean
  ogImage?: string | null
}

interface UpdatePostData {
  title?: string
  subtitle?: string
  slug?: string
  markdown?: string
  polyhedraShape?: string | null
  status?: string
  // SEO fields
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  noIndex?: boolean
  ogImage?: string | null
}

type PostResult = 
  | { success: true; post: Post }
  | { success: false; error: string }

/**
 * Shared post update logic used by both /api/posts/[id] and /api/posts/by-slug/[slug]
 * Handles validation, slug uniqueness, revision creation, shape assignment, and cache revalidation
 */
export async function updatePost(post: Post, data: UpdatePostData): Promise<PostResult> {
  const updates: Record<string, unknown> = {}

  // Validate and set title
  if (data.title !== undefined) {
    if (!data.title.trim()) return { success: false, error: 'Title is required' }
    updates.title = data.title.trim()
  }

  // Validate and set slug (check uniqueness if changed)
  if (data.slug !== undefined) {
    if (!data.slug.trim()) return { success: false, error: 'Slug is required' }
    if (data.slug !== post.slug) {
      const existing = await prisma.post.findUnique({ where: { slug: data.slug } })
      if (existing) return { success: false, error: `Slug "${data.slug}" already exists` }
    }
    updates.slug = data.slug.trim()
  }

  // Set optional fields
  if (data.subtitle !== undefined) updates.subtitle = data.subtitle || null
  if (data.polyhedraShape !== undefined) updates.polyhedraShape = data.polyhedraShape
  if (data.markdown !== undefined) updates.markdown = data.markdown

  // SEO fields
  if (data.seoTitle !== undefined) updates.seoTitle = data.seoTitle || null
  if (data.seoDescription !== undefined) updates.seoDescription = data.seoDescription || null
  if (data.seoKeywords !== undefined) updates.seoKeywords = data.seoKeywords || null
  if (data.noIndex !== undefined) updates.noIndex = data.noIndex
  if (data.ogImage !== undefined) updates.ogImage = data.ogImage || null

  // Handle status change
  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'published' && !post.publishedAt) updates.publishedAt = new Date()
  }

  // Assign random shape on first publish if none set
  const isFirstPublish = data.status === 'published' && !post.publishedAt && !post.polyhedraShape
  if (isFirstPublish) {
    updates.polyhedraShape = getRandomShape()
  }

  // Check if any revision-tracked fields changed
  const newTitle = (updates.title as string) ?? post.title
  const newSubtitle = (updates.subtitle as string | null) ?? post.subtitle
  const newMarkdown = (updates.markdown as string) ?? post.markdown
  const newPolyhedraShape = (updates.polyhedraShape as string | null) ?? post.polyhedraShape
  const newSeoTitle = (updates.seoTitle as string | null) ?? post.seoTitle
  const newSeoDescription = (updates.seoDescription as string | null) ?? post.seoDescription
  const newSeoKeywords = (updates.seoKeywords as string | null) ?? post.seoKeywords

  const hasContentChanges = 
    newTitle !== post.title ||
    newSubtitle !== post.subtitle ||
    newMarkdown !== post.markdown ||
    newPolyhedraShape !== post.polyhedraShape ||
    newSeoTitle !== post.seoTitle ||
    newSeoDescription !== post.seoDescription ||
    newSeoKeywords !== post.seoKeywords

  // Create revision if content changed
  if (hasContentChanges) {
    await prisma.revision.create({
      data: {
        postId: post.id,
        title: newTitle,
        subtitle: newSubtitle,
        markdown: newMarkdown,
        polyhedraShape: newPolyhedraShape,
        seoTitle: newSeoTitle,
        seoDescription: newSeoDescription,
        seoKeywords: newSeoKeywords,
      }
    })
  }

  const updated = await prisma.post.update({ where: { id: post.id }, data: updates })

  // Revalidate cached pages
  revalidatePath('/')
  revalidatePath(`/e/${updated.slug}`)
  if (updates.slug && updates.slug !== post.slug) {
    revalidatePath(`/e/${post.slug}`)
  }

  return { success: true, post: updated }
}

/**
 * Create a new post with validation, slug uniqueness check, and initial revision.
 * Used by POST /api/posts
 */
export async function createPost(data: CreatePostData): Promise<PostResult> {
  // Validate required fields
  if (!data.title?.trim()) {
    return { success: false, error: 'Title is required' }
  }
  if (!data.slug?.trim()) {
    return { success: false, error: 'Slug is required' }
  }

  const title = data.title.trim()
  const slug = data.slug.trim()
  const subtitle = data.subtitle?.trim() || null
  const markdown = data.markdown ?? ''
  const polyhedraShape = data.polyhedraShape || null
  const status = data.status ?? 'draft'
  const seoTitle = data.seoTitle || null
  const seoDescription = data.seoDescription || null
  const seoKeywords = data.seoKeywords || null
  const noIndex = data.noIndex ?? false
  const ogImage = data.ogImage || null

  // Check slug uniqueness
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    return { success: false, error: `Slug "${slug}" already exists` }
  }

  // Create post with initial revision
  const post = await prisma.post.create({
    data: {
      title,
      subtitle,
      slug,
      markdown,
      polyhedraShape,
      status,
      publishedAt: status === 'published' ? new Date() : null,
      seoTitle,
      seoDescription,
      seoKeywords,
      noIndex,
      ogImage,
      revisions: {
        create: {
          title,
          subtitle,
          markdown,
          polyhedraShape,
          seoTitle,
          seoDescription,
          seoKeywords,
        },
      },
    },
  })

  // Invalidate homepage cache
  revalidatePath('/')

  return { success: true, post }
}

/**
 * Soft delete a post by setting status to 'deleted'.
 * Used by DELETE /api/posts/[id] and DELETE /api/posts/by-slug/[slug]
 */
export async function deletePost(postOrId: Post | string): Promise<PostResult> {
  // Accept either a Post object or an ID string
  const post = typeof postOrId === 'string'
    ? await prisma.post.findUnique({ where: { id: postOrId } })
    : postOrId

  if (!post) {
    return { success: false, error: 'Post not found' }
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { status: 'deleted' },
  })

  // Revalidate cached pages
  revalidatePath('/')
  revalidatePath(`/e/${post.slug}`)

  return { success: true, post: updated }
}


