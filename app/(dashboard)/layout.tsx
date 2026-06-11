import type { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileBottomBar from '@/components/layout/MobileBottomBar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface pb-16 md:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {children}
      </main>
      <MobileBottomBar />
    </div>
  )
}
