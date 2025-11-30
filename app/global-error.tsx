'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400">
              A critical error occurred.
            </p>
            <button
              onClick={reset}
              className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

