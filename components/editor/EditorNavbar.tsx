'use client'

import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from '@/components/Icons'
import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'

interface EditorNavbarProps {
  status: 'draft' | 'published'
  hasUnsavedChanges: boolean
  saving: boolean
  onSave: (status: 'draft' | 'published') => void
}

export function EditorNavbar({
  status,
  hasUnsavedChanges,
  saving,
  onSave,
}: EditorNavbarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Leave anyway?')
      if (!confirmed) return
    }
    router.push('/writer')
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

          {status === 'draft' && (
            <Button
              variant="secondary"
              onClick={() => onSave('draft')}
              disabled={saving || !hasUnsavedChanges}
            >
              {saving && <PolyhedraCanvas shape="cube" size={16} clicked={true} />}
              {hasUnsavedChanges ? 'Save Draft' : 'Saved'}
            </Button>
          )}

          <Button
            onClick={() => onSave('published')}
            disabled={saving || (status === 'published' && !hasUnsavedChanges)}
          >
            {saving && <PolyhedraCanvas shape="cube" size={16} clicked={true} />}
            {status === 'published' && !hasUnsavedChanges ? 'Published' : 'Publish'}
          </Button>
        </div>
      </div>
    </header>
  )
}
