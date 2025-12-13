'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { RevisionFull } from '@/lib/editor/types'

interface Props {
  revision: RevisionFull
  onCancel: () => void
  onRestore: () => void
}

export function RevisionPreviewBanner({ revision, onCancel, onRestore }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <span className="text-sm text-amber-800 dark:text-amber-200">
            Previewing revision from {formatRelativeTime(revision.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowConfirm(true)}>
              Restore
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this revision?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current content will be saved as a new revision before
              restoring, so you can undo this action later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false)
                onRestore()
              }}
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}




