'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
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
import { ChevronLeftIcon, ChatIcon } from '@/components/Icons'

type SaveStatus = 'draft' | 'published'

interface SaveButtonProps {
  target: SaveStatus
  label: string
  savedLabel: string
  variant?: 'default' | 'secondary'
  savingAs: SaveStatus | null
  disabled: boolean
  onSave: (status: SaveStatus) => void
}

function SaveButton({ target, label, savedLabel, variant = 'default', savingAs, disabled, onSave }: SaveButtonProps) {
  const isSaving = savingAs === target
  const isSaved = disabled && savingAs === null
  
  return (
    <Button
      variant={variant}
      onClick={() => onSave(target)}
      disabled={savingAs !== null || disabled}
    >
      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSaved ? savedLabel : label}
    </Button>
  )
}

interface PreviewModeProps {
  onCancel: () => void
  onRestore: () => void
}

interface EditorNavbarProps {
  status: SaveStatus
  hasUnsavedChanges: boolean
  savingAs: SaveStatus | null
  onSave: (status: SaveStatus) => void
  previewMode?: PreviewModeProps
  onOpenChat?: () => void
}

export function EditorNavbar({
  status,
  hasUnsavedChanges,
  savingAs,
  onSave,
  previewMode,
  onOpenChat,
}: EditorNavbarProps) {
  const router = useRouter()
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Leave anyway?')
      if (!confirmed) return
    }
    router.push('/writer')
  }

  // Preview mode: show different navbar
  if (previewMode) {
    return (
      <>
        <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 touch-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <button
              onClick={previewMode.onCancel}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronLeftIcon />
              <span>Back to editor</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" onClick={previewMode.onCancel}>
                Cancel
              </Button>
              <Button onClick={() => setShowRestoreConfirm(true)}>
                Restore
              </Button>
            </div>
          </div>
        </header>

        <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
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
                  setShowRestoreConfirm(false)
                  previewMode.onRestore()
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

  return (
    <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 touch-none">
      <div className="flex items-center justify-between pointer-events-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="w-9 h-9 rounded-lg border border-border hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open chat"
            >
              <ChatIcon />
            </button>
          )}

          {status === 'draft' && (
            <SaveButton
              target="draft"
              label="Save Draft"
              savedLabel="Saved"
              variant="secondary"
              savingAs={savingAs}
              disabled={!hasUnsavedChanges}
              onSave={onSave}
            />
          )}

          <SaveButton
            target="published"
            label="Publish"
            savedLabel="Published"
            savingAs={savingAs}
            disabled={status === 'published' && !hasUnsavedChanges}
            onSave={onSave}
          />
        </div>
      </div>
    </header>
  )
}
