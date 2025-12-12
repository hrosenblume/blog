'use client'

import { useRouter } from 'next/navigation'
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

interface AdminActionsMenuProps {
  editHref: string
  viewHref?: string
  deleteEndpoint: string
  deleteConfirmMessage: string
}

export function AdminActionsMenu({
  editHref,
  viewHref,
  deleteEndpoint,
  deleteConfirmMessage,
}: AdminActionsMenuProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(deleteConfirmMessage)) return
    const res = await fetch(deleteEndpoint, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVerticalIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={editHref}>Edit</Link>
        </DropdownMenuItem>
        {viewHref && (
          <DropdownMenuItem asChild>
            <Link href={viewHref} target="_blank">View</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
