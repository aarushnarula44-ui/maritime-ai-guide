import type { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileBottomBar from '@/components/layout/MobileBottomBar'

export const metadata = { title: 'NavAI Advisor — Maritime AI Guide' }

export default function AdvisorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 overflow-hidden pt-16">{children}</main>
      <MobileBottomBar />
    </div>
  )
}
