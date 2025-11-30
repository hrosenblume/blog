'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/Button'
import { Dropdown, DropdownItem } from '@/components/Dropdown'

interface EditorNavbarProps {
  postSlug: string | undefined
  slug: string
  status: 'draft' | 'published'
  showMarkdown: boolean
  setShowMarkdown: (show: boolean) => void
  hasUnsavedChanges: boolean
  saving: boolean
  onSave: (status: 'draft' | 'published') => void
  onUnpublish: () => void
  onDelete: () => void
}

export function EditorNavbar({
  postSlug,
  slug,
  status,
  showMarkdown,
  setShowMarkdown,
  hasUnsavedChanges,
  saving,
  onSave,
  onUnpublish,
  onDelete,
}: EditorNavbarProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/writer"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setShowMarkdown(!showMarkdown)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showMarkdown
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            } text-gray-700 dark:text-gray-300`}
            title={showMarkdown ? 'Switch to rich text editor' : 'Switch to raw markdown'}
          >
            {showMarkdown ? 'Rich Text' : 'Markdown'}
          </button>

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

          {postSlug && (
            <Dropdown
              trigger={
                <button
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  aria-label="More actions"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              }
            >
              {status === 'published' && (
                <>
                  <DropdownItem onClick={() => window.open(`/e/${slug}`, '_blank')}>
                    View live
                  </DropdownItem>
                  <DropdownItem onClick={onUnpublish}>
                    Unpublish
                  </DropdownItem>
                </>
              )}
              <DropdownItem destructive onClick={onDelete}>
                Delete
              </DropdownItem>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  )
}

