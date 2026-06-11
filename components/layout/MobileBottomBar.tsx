'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckCircle, BookOpen, Sparkles, User } from 'lucide-react'

const TABS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/eligibility', icon: CheckCircle, label: 'Eligibility' },
  { href: '/courses', icon: BookOpen, label: 'Courses' },
  { href: '/advisor', icon: Sparkles, label: 'NavAI' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function MobileBottomBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border">
      <div className="flex">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-2 gap-0.5"
            >
              <tab.icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-muted'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-accent' : 'text-text-muted'}`}>
                {tab.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-accent" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
