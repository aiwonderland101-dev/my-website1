import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Page not found</h2>
        
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to home
          </Link>
          
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <p className="text-gray-500 text-xs mt-8">
          Need help? <a href="mailto:support@wonderspace.ai" className="text-purple-400 hover:text-purple-300">Contact support</a>
        </p>
      </div>
    </div>
  )
}
