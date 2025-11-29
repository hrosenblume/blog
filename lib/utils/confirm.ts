export function confirmPublish(): boolean {
  return window.confirm('Are you sure you want to publish?')
}

export function confirmUnpublish(title: string): boolean {
  return window.confirm(`Unpublish "${title}"?`)
}

