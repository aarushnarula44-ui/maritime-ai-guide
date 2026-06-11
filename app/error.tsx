'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-6xl font-bold text-danger mb-4">⚠️</p>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-blue-200 mb-8 max-w-md text-sm">{error.message || 'An unexpected error occurred. Please try again.'}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-accent text-primary font-semibold px-6 py-2.5 rounded-full hover:bg-accent-dark transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-white/30 text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
