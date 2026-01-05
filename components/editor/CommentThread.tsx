'use client'

import { useState } from 'react'
import { MoreHorizontal, Reply, Check, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import { CommentWithUser, canEditComment, canDeleteComment } from '@/lib/comments'

interface CommentThreadProps {
  comment: CommentWithUser
  currentUserEmail: string
  isAdmin: boolean
  isActive: boolean
  onReply: (content: string) => Promise<void>
  onEdit: (content: string) => Promise<void>
  onDelete: () => Promise<void>
  onResolve: () => Promise<void>
  onClick: () => void
}

export function CommentThread({
  comment,
  currentUserEmail,
  isAdmin,
  isActive,
  onReply,
  onEdit,
  onDelete,
  onResolve,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)

  const canEdit = canEditComment(comment, currentUserEmail)
  const canDelete = canDeleteComment(comment, currentUserEmail, isAdmin)
  const isOwn = comment.user.email === currentUserEmail

  const handleReply = async () => {
    if (!replyContent.trim()) return
    setLoading(true)
    try {
      await onReply(replyContent.trim())
      setReplyContent('')
      setIsReplying(false)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    setLoading(true)
    try {
      await onEdit(editContent.trim())
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return
    setLoading(true)
    try {
      await onDelete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isActive
          ? 'border-yellow-400 bg-yellow-50/50 dark:border-yellow-600 dark:bg-yellow-900/20'
          : 'border-border bg-background',
        comment.resolved && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            {isOwn ? 'You' : comment.user.name || comment.user.email.split('@')[0]}
          </span>
          <span className="text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {comment.resolved && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="w-3 h-3" />
              Resolved
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-6 h-6 rounded hover:bg-accent flex items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[80]">
            <DropdownMenuItem onClick={onResolve}>
              <Check className="w-4 h-4 mr-2" />
              {comment.resolved ? 'Unresolve' : 'Resolve'}
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quoted text */}
      {comment.quotedText && (
        <div className="mb-2 px-2 py-1 bg-yellow-100/50 dark:bg-yellow-900/30 rounded text-sm italic text-muted-foreground line-clamp-2">
          "{comment.quotedText}"
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.stopPropagation()
                handleEdit()
              }
              if (e.key === 'Escape') {
                e.stopPropagation()
                setIsEditing(false)
                setEditContent(comment.content)
              }
            }}
            className="min-h-[60px]"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false)
                setEditContent(comment.content)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l-2 border-border space-y-3">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserEmail={currentUserEmail}
            />
          ))}
        </div>
      )}

      {/* Reply button / form */}
      {!isEditing && (
        <div className="mt-3">
          {isReplying ? (
            <div className="space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleReply()
                  }
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    setIsReplying(false)
                    setReplyContent('')
                  }
                }}
                placeholder="Write a reply..."
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleReply}
                  disabled={loading || !replyContent.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsReplying(true)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Simple reply display (no nested replies allowed)
function ReplyItem({
  reply,
  currentUserEmail,
}: {
  reply: CommentWithUser
  currentUserEmail: string
}) {
  const isOwn = reply.user.email === currentUserEmail

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">
          {isOwn ? 'You' : reply.user.name || reply.user.email.split('@')[0]}
        </span>
        <span className="text-muted-foreground text-xs">
          {formatRelativeTime(reply.createdAt)}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-muted-foreground">{reply.content}</p>
    </div>
  )
}

