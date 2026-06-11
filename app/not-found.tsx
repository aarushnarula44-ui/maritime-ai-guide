import Link from 'next/link'
import { Anchor } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center text-center px-4">
      <Anchor className="w-12 h-12 text-accent mb-4" />
      <p className="font-display text-8xl font-bold text-accent mb-2">404</p>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-blue-200 mb-8">The page you are looking for does not exist.</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-accent text-primary font-semibold px-6 py-2.5 rounded-full hover:bg-accent-dark transition"
        >
          Go to Homepage
        </Link>
        <Link
          href="/advisor"
          className="border border-white/30 text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition text-sm"
        >
          Ask NavAI for help
        </Link>
      </div>
    </div>
  )
}
