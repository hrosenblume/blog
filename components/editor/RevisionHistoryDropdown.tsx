'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { HistoryIcon } from '@/components/Icons'
import { formatRelativeTime } from '@/lib/utils/format'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RevisionSummary } from '@/lib/editor/types'

interface Props {
  revisions: RevisionSummary[]
  loading: boolean
  previewLoading: boolean
  disabled: boolean
  isPreviewMode: boolean
  onOpen: () => void
  onSelect: (id: string) => void
}

export function RevisionHistoryDropdown({
  revisions,
  loading,
  previewLoading,
  disabled,
  isPreviewMode,
  onOpen,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) onOpen()
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || isPreviewMode || previewLoading}
          title={disabled ? 'Save post to enable history' : 'Revision history'}
          className="px-2.5 py-1.5 text-sm font-medium rounded transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
        >
          {previewLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HistoryIcon />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Revision History</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : revisions.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No revisions yet
          </div>
        ) : (
          revisions.map((rev) => (
            <DropdownMenuItem
              key={rev.id}
              onClick={() => {
                onSelect(rev.id)
                setOpen(false)
              }}
            >
              <div className="flex flex-col">
                <span className="truncate">{rev.title || 'Untitled'}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(rev.createdAt)}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
