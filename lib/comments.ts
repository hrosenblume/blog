/**
 * Comment types and client-side API helpers.
 * Used by the editor's commenting system.
 */

// Types matching Prisma schema + includes
export interface CommentUser {
  id: string
  name: string | null
  email: string
}

export interface CommentWithUser {
  id: string
  postId: string
  userId: string
  quotedText: string
  content: string
  parentId: string | null
  resolved: boolean
  createdAt: string
  updatedAt: string
  user: CommentUser
  replies?: CommentWithUser[]
}

export interface CreateCommentData {
  quotedText: string
  content: string
  parentId?: string
}

// Permission helpers (compare by email since that's what we have in session)
export function canDeleteComment(
  comment: CommentWithUser,
  currentUserEmail: string,
  isAdmin: boolean
): boolean {
  return comment.user.email === currentUserEmail || isAdmin
}

export function canEditComment(
  comment: CommentWithUser,
  currentUserEmail: string
): boolean {
  return comment.user.email === currentUserEmail
}

// API client functions
export async function fetchComments(postId: string): Promise<CommentWithUser[]> {
  const res = await fetch(`/api/posts/${postId}/comments`)
  if (!res.ok) throw new Error('Failed to fetch comments')
  return res.json()
}

export async function createComment(
  postId: string,
  data: CreateCommentData
): Promise<CommentWithUser> {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create comment')
  }
  return res.json()
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string
): Promise<CommentWithUser> {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update comment')
  }
  return res.json()
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete comment')
  }
}

export async function toggleResolve(
  postId: string,
  commentId: string
): Promise<CommentWithUser> {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}/resolve`, {
    method: 'POST',
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to toggle resolve')
  }
  return res.json()
}

export async function resolveAllComments(
  postId: string
): Promise<{ resolved: number }> {
  const res = await fetch(`/api/posts/${postId}/comments/resolve-all`, {
    method: 'POST',
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to resolve all comments')
  }
  return res.json()
}

