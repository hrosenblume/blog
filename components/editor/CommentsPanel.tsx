'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, MessageSquare, ArrowUp, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import { CommentWithUser } from '@/lib/comments'
import { CommentThread } from './CommentThread'

interface CommentsPanelProps {
  comments: CommentWithUser[]
  currentUserEmail: string
  isAdmin: boolean
  selectedText: string | null
  onCreateComment: (content: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onResolve: (commentId: string) => Promise<void>
  onCommentClick: (commentId: string) => void
  activeCommentId: string | null
  isOpen: boolean
  onClose: () => void
  onClearSelection: () => void
}

export function CommentsPanel({
  comments,
  currentUserEmail,
  isAdmin,
  selectedText,
  onCreateComment,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onCommentClick,
  activeCommentId,
  isOpen,
  onClose,
  onClearSelection,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Separate open and resolved comments
  const openComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  // Client-side only for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle open/close animation and body scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Focus textarea when selected text changes
  useEffect(() => {
    if (selectedText && isOpen) {
      textareaRef.current?.focus()
    }
  }, [selectedText, isOpen])

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [newComment])

  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim() || !selectedText) return
    setCreating(true)
    try {
      await onCreateComment(newComment.trim())
      setNewComment('')
      onClearSelection()
    } finally {
      setCreating(false)
    }
  }, [newComment, selectedText, onCreateComment, onClearSelection])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleCreateComment()
    }
    if (e.key === 'Escape') {
      e.stopPropagation()
      if (selectedText) {
        onClearSelection()
        setNewComment('')
      } else {
        onClose()
      }
    }
  }

  if (!isVisible || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 h-[100dvh] bg-black/20 z-[60] transition-opacity duration-200',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        className={cn(
          'fixed z-[70] flex flex-col bg-background shadow-xl transition-transform duration-200 ease-out overflow-hidden',
          'inset-x-0 top-0 h-[100dvh]',
          'md:left-auto md:w-full md:max-w-[380px] md:border-l md:border-border',
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-medium">Comments</h2>
            {openComments.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({openComments.length})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md interactive-bg-accent flex items-center justify-center text-muted-foreground"
            aria-label="Close comments"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New comment section - shown when text is selected */}
        {selectedText && (
          <div className="flex-shrink-0 border-b border-border px-4 py-5 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 px-2 py-1 bg-yellow-100/50 dark:bg-yellow-900/30 rounded text-sm italic text-muted-foreground line-clamp-2">
                "{selectedText}"
              </div>
              <button
                type="button"
                onClick={() => {
                  onClearSelection()
                  setNewComment('')
                }}
                disabled={creating}
                className="ml-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="min-h-[60px] max-h-[120px] resize-none"
                rows={2}
                enterKeyHint="send"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="rounded-full w-10 h-10 flex-shrink-0 border border-input touch-manipulation"
                onClick={handleCreateComment}
                disabled={creating || !newComment.trim()}
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Comments list - hidden when composing new comment */}
        <div className={cn("flex-1 overflow-y-auto", selectedText && "hidden")}>
          {comments.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs px-6">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No comments yet. Select text and click the comment button to add one.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Open comments */}
              {openComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserEmail={currentUserEmail}
                  isAdmin={isAdmin}
                  isActive={activeCommentId === comment.id}
                  onReply={(content) => onReply(comment.id, content)}
                  onEdit={(content) => onEdit(comment.id, content)}
                  onDelete={() => onDelete(comment.id)}
                  onResolve={() => onResolve(comment.id)}
                  onClick={() => onCommentClick(comment.id)}
                />
              ))}

              {/* Resolved comments section */}
              {resolvedComments.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResolved(!showResolved)}
                    className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    <span className="inline-flex items-center gap-1">
                      {showResolved ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Resolved ({resolvedComments.length})
                    </span>
                  </button>
                  {showResolved && (
                    <div className="space-y-3 mt-2">
                      {resolvedComments.map((comment) => (
                        <CommentThread
                          key={comment.id}
                          comment={comment}
                          currentUserEmail={currentUserEmail}
                          isAdmin={isAdmin}
                          isActive={activeCommentId === comment.id}
                          onReply={(content) => onReply(comment.id, content)}
                          onEdit={(content) => onEdit(comment.id, content)}
                          onDelete={() => onDelete(comment.id)}
                          onResolve={() => onResolve(comment.id)}
                          onClick={() => onCommentClick(comment.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={commentsEndRef} />
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

