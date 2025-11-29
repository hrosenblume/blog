const colors: Record<string, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  writer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.writer}`}>
    {status}
  </span>
)

