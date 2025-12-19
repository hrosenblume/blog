'use client'

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVerticalIcon } from '@/components/Icons'
import { formatRelativeTime } from '@/lib/utils/format'

export interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'deleted'
  wordCount: number
  updatedAt: string
  publishedAt: string | null
}

interface PostItemProps {
  post: Post
  onDelete: (id: string) => void
  onUnpublish: (id: string) => void
  onPublish: (id: string) => void
  showStatus?: boolean
}

export function PostItem({ post, onDelete, onUnpublish, onPublish, showStatus }: PostItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border group">
      <div className="flex-1 min-w-0">
        <Link href={`/writer/editor/${post.slug}`} className="block">
          <h3 className="font-medium truncate group-hover:text-muted-foreground">
            {post.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {showStatus && (
              <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-medium ${
                post.status === 'draft' 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-green-500/20 text-green-600 dark:text-green-400'
              }`}>
                {post.status}
              </span>
            )}
            <span>{formatRelativeTime(post.updatedAt)} · {post.wordCount} words</span>
          </p>
        </Link>
      </div>
      
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/writer/editor/${post.slug}`}>Edit</Link>
          </DropdownMenuItem>
          {post.status === 'draft' && (
            <DropdownMenuItem onClick={() => onPublish(post.id)}>
              Publish
            </DropdownMenuItem>
          )}
          {post.status === 'published' && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/e/${post.slug}`} target="_blank">View Live</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUnpublish(post.id)}>
                Unpublish
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(post.id)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
