/**
 * Simple confirmation dialogs for common actions.
 * Returns true if user confirms, false otherwise.
 */
export const confirm = (message: string): boolean => window.confirm(message)

export const confirmPublish = (): boolean => confirm('Are you sure you want to publish?')

export const confirmUnpublish = (title: string): boolean => confirm(`Unpublish "${title}"?`)

export const confirmDelete = (item: string): boolean => confirm(`Delete "${item}"? This cannot be undone.`)
