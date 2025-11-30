'use client'

import { signIn } from 'next-auth/react'
import { CenteredPage } from '@/components/CenteredPage'
import { GoogleIcon } from '@/components/Icons'

export default function SignIn() {
  return (
    <CenteredPage className="bg-page">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-title font-bold text-gray-900 dark:text-white">
            Writer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>
        
        <button
          onClick={() => signIn('google', { callbackUrl: '/writer' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </CenteredPage>
  )
}

