'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVerticalIcon } from '@/components/Icons'

interface ActionItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  variant?: 'default' | 'destructive'
}

interface AdminActionsMenuProps {
  actions: ActionItem[]
}

export function AdminActionsMenu({ actions }: AdminActionsMenuProps) {
  // Find destructive actions to show after separator
  const normalActions = actions.filter(a => a.variant !== 'destructive')
  const destructiveActions = actions.filter(a => a.variant === 'destructive')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVerticalIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {normalActions.map((action, i) => (
          action.href ? (
            <DropdownMenuItem key={i} asChild disabled={action.disabled}>
              <Link href={action.href} className="flex items-center gap-2">
                {action.icon}
                {action.label}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              key={i} 
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          )
        ))}
        {destructiveActions.length > 0 && <DropdownMenuSeparator />}
        {destructiveActions.map((action, i) => (
          <DropdownMenuItem
            key={i}
            onClick={action.onClick}
            disabled={action.disabled}
            className="text-destructive focus:text-destructive flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Legacy helper for simple edit/delete patterns
interface SimpleActionsProps {
  editHref: string
  viewHref?: string
  deleteEndpoint: string
  deleteConfirmMessage: string
}

export function SimpleActionsMenu({
  editHref,
  viewHref,
  deleteEndpoint,
  deleteConfirmMessage,
}: SimpleActionsProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(deleteConfirmMessage)) return
    const res = await fetch(deleteEndpoint, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      toast.error('Failed to delete')
    }
  }

  const actions: ActionItem[] = [
    { label: 'Edit', href: editHref },
    ...(viewHref ? [{ label: 'View', href: viewHref }] : []),
    { label: 'Delete', onClick: handleDelete, variant: 'destructive' as const },
  ]

  return <AdminActionsMenu actions={actions} />
}
