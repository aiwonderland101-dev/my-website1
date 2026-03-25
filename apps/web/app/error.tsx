'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.) when integrated
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            500
          </h1>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Something went wrong!</h2>
        
        <p className="text-gray-400 mb-2 text-sm">
          {error.message || 'An unexpected error occurred. Our team has been notified.'}
        </p>
        
        {error.digest && (
          <p className="text-gray-600 text-xs mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="text-gray-500 text-xs mt-8">
          If this problem persists, please contact support@wonderspace.ai
        </p>
      </div>
    </div>
  )
}
