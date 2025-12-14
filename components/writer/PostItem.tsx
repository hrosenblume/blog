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
}

export function PostItem({ post, onDelete, onUnpublish, onPublish }: PostItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border group">
      <div className="flex-1 min-w-0">
        <Link href={`/writer/editor/${post.slug}`} className="block">
          <h3 className="font-medium truncate group-hover:text-muted-foreground">
            {post.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatRelativeTime(post.updatedAt)} · {post.wordCount} words
          </p>
        </Link>
      </div>
      
      <DropdownMenu>
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
