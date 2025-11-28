'use client'

import { useRouter } from 'next/navigation'

export function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"?`)) {
      return
    }

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete user')
    }
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


