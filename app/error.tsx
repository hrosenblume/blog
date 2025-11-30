'use client'

import { useEffect } from 'react'
import { CenteredPage } from '@/components/CenteredPage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <CenteredPage className="bg-page">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h1 className="text-title font-bold text-red-600">Something went wrong</h1>
        <p className="text-body text-gray-600 dark:text-gray-400">
          An unexpected error occurred.
        </p>
        <button
          onClick={reset}
          className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </CenteredPage>
  )
}

