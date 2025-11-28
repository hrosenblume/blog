'use client'

import { useRouter } from 'next/navigation'

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${postTitle || 'Untitled'}"? This will also delete all revisions.`)) {
      return
    }

    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete post')
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


