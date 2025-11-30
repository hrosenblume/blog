'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/Button'

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
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/writer"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle size="md" />

          {status === 'draft' && (
            <Button
              variant="secondary"
              onClick={() => onSave('draft')}
              loading={saving}
              disabled={!hasUnsavedChanges}
            >
              {hasUnsavedChanges ? 'Save Draft' : 'Saved'}
            </Button>
          )}

          <Button
            onClick={() => onSave('published')}
            loading={saving}
            disabled={status === 'published' && !hasUnsavedChanges}
          >
            {status === 'published' && !hasUnsavedChanges ? 'Published' : 'Publish'}
          </Button>
        </div>
      </div>
    </header>
  )
}

