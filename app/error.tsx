'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function classifyError(error: Error): { title: string; message: string } {
  const msg = error.message?.toLowerCase() ?? ''

  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
    return { title: 'Connection error', message: 'Check your internet connection and try again.' }
  }
  if (msg.includes('unauthorized') || msg.includes('unauthenticated') || error.name === 'AuthError') {
    return { title: 'Session expired', message: 'Please sign in again to continue.' }
  }
  if (msg.includes('not found') || msg.includes('404')) {
    return { title: 'Not found', message: 'The page or resource you were looking for does not exist.' }
  }
  return { title: 'Something went wrong', message: 'An unexpected error occurred. Please try again.' }
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const { title, message } = classifyError(error)

  const isAuthError =
    error.message?.toLowerCase().includes('unauthorized') ||
    error.message?.toLowerCase().includes('unauthenticated') ||
    error.name === 'AuthError'

  useEffect(() => {
    console.error('[App Error]', { name: error.name, message: error.message, digest: error.digest })
  }, [error])

  function handleAction() {
    if (isAuthError) {
      router.push('/login')
    } else {
      reset()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="font-display text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-blue-200 mb-8 max-w-md text-sm">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAction}
          className="bg-accent text-primary font-semibold px-6 py-2.5 rounded-full hover:bg-accent-dark transition"
        >
          {isAuthError ? 'Sign In' : 'Try Again'}
        </button>
        <Link
          href="/"
          className="border border-white/30 text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition"
        >
          Go to Homepage
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-white/30 text-xs font-mono">Error code: {error.digest}</p>
      )}
    </div>
  )
}
