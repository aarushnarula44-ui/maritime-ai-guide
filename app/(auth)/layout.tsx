import type { ReactNode } from 'react'
import { Anchor } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-white">
          <Anchor className="w-8 h-8 text-accent" />
          <span className="font-display text-xl font-semibold">Maritime AI Guide</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal p-8">
        {children}
      </div>

      <p className="mt-6 text-blue-200 text-sm flex items-center gap-1">
        <span>🛡️</span>
        <span>Based on Official DGS Guidelines</span>
      </p>
    </div>
  )
}
