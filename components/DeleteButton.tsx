'use client'

import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  endpoint: string
  confirmMessage: string
}

export function DeleteButton({ endpoint, confirmMessage }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(confirmMessage)) return
    const res = await fetch(endpoint, { method: 'DELETE' })
    res.ok ? router.refresh() : alert('Failed to delete')
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  )
}

