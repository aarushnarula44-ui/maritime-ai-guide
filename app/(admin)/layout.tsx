'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Briefcase,
  Database,
  Users,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Bell,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  superAdminOnly?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'Courses', href: '/admin/content/courses', icon: <BookOpen size={16} /> },
      { label: 'Colleges', href: '/admin/content/colleges', icon: <GraduationCap size={16} /> },
      { label: 'Sponsorships', href: '/admin/content/sponsorships', icon: <Briefcase size={16} /> },
      { label: 'Knowledge Base', href: '/admin/knowledge', icon: <Database size={16} /> },
    ],
  },
  {
    title: 'USERS',
    items: [
      { label: 'All Users', href: '/admin/users', icon: <Users size={16} /> },
      { label: 'Fraud Reports', href: '/admin/fraud', icon: <AlertTriangle size={16} /> },
    ],
  },
  {
    title: 'AI SYSTEM',
    items: [
      { label: 'NavAI Logs', href: '/admin/ai/logs', icon: <MessageSquare size={16} /> },
      { label: 'Knowledge Gaps', href: '/admin/ai/gaps', icon: <TrendingUp size={16} /> },
      { label: 'Cost Monitor', href: '/admin/ai/costs', icon: <DollarSign size={16} /> },
    ],
  },
  {
    title: 'COMMUNICATIONS',
    items: [
      { label: 'Announcements', href: '/admin/announcements', icon: <Bell size={16} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Audit Log', href: '/admin/audit', icon: <ClipboardList size={16} />, superAdminOnly: true },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={16} />, superAdminOnly: true },
    ],
  },
]

function SidebarContent({
  role,
  userName,
  onSignOut,
  onClose,
}: {
  role: string
  userName: string
  onSignOut: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <div>
          <div className="text-white font-bold text-sm">Maritime AI Guide</div>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full mt-1 inline-block">
            Admin
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.superAdminOnly || role === 'super_admin'
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title}>
              <p className="text-xs text-slate-500 font-semibold tracking-wider px-2 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive(item.href)
                        ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <div>
          <p className="text-sm text-white font-medium truncate">{userName}</p>
          <span className="text-xs text-slate-400 capitalize">{role.replace('_', ' ')}</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          onClick={onClose}
        >
          Back to Platform <ChevronRight size={12} />
        </Link>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState('')
  const [userName, setUserName] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()
      if (data) {
        const p = data as { role: string; full_name: string | null; email: string | null }
        setRole(p.role)
        setUserName(p.full_name || p.email || 'Admin')
      }
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Derive page title from pathname
  function getPageTitle() {
    const map: Record<string, string> = {
      '/admin': 'Overview',
      '/admin/users': 'Users',
      '/admin/content/colleges': 'Colleges',
      '/admin/content/courses': 'Courses',
      '/admin/content/sponsorships': 'Sponsorships',
      '/admin/knowledge': 'Knowledge Base',
      '/admin/fraud': 'Fraud Reports',
      '/admin/ai/logs': 'NavAI Logs',
      '/admin/ai/gaps': 'Knowledge Gaps',
      '/admin/ai/costs': 'Cost Monitor',
      '/admin/announcements': 'Announcements',
      '/admin/audit': 'Audit Log',
      '/admin/settings': 'Settings',
    }
    for (const [key, val] of Object.entries(map)) {
      if (pathname.startsWith(key) && (pathname === key || pathname[key.length] === '/')) {
        return val
      }
    }
    return 'Admin'
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0A1628] border-r border-white/10 flex-shrink-0">
        <SidebarContent
          role={role}
          userName={userName}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0A1628] flex flex-col">
            <SidebarContent
              role={role}
              userName={userName}
              onSignOut={handleSignOut}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              View Platform <ExternalLink size={12} />
            </Link>
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-sm font-bold text-cyan-700">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
