'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      Delete
    </Button>
  )
}
