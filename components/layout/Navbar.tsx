'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Anchor, Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard, Sparkles, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const NAV_LINKS = [
  { href: '/eligibility', label: 'Check Eligibility' },
  { href: '/courses', label: 'Courses' },
  { href: '/colleges', label: 'Colleges' },
  { href: '/cet', label: 'CET Prep' },
  { href: '/salary', label: 'Salaries' },
]

const RESOURCES_LINKS = [
  { href: '/roadmap', label: 'Career Roadmap' },
  { href: '/medical', label: 'Medical Requirements' },
  { href: '/fraud-protection', label: 'Fraud Protection' },
  { href: '/parents', label: 'For Parents' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-card py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Anchor className={`w-6 h-6 ${scrolled ? 'text-accent' : 'text-accent'}`} />
            <div className="flex flex-col leading-tight">
              <span className={`font-display font-semibold text-lg ${scrolled ? 'text-primary' : 'text-white'}`}>
                Maritime AI Guide
              </span>
              <span className={`text-[10px] font-medium tracking-wide ${scrolled ? 'text-text-muted' : 'text-blue-200'}`}>
                Made by Aarush Narula
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-accent underline underline-offset-4'
                    : scrolled ? 'text-primary hover:text-accent' : 'text-blue-100 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 150)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  scrolled ? 'text-primary hover:text-accent' : 'text-blue-100 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Resources
                <ChevronDown className="w-3 h-3" />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-floating border border-border py-1 animate-fade-in z-50">
                  {RESOURCES_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-surface"
                      onClick={() => setResourcesOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <GlobalSearch />
            <Link
              href="/advisor"
              className="flex items-center gap-1.5 bg-accent text-primary text-sm font-semibold px-4 py-2 rounded-full hover:bg-accent-dark transition"
            >
              <Sparkles className="w-4 h-4" />
              Ask NavAI
            </Link>

            {user && <NotificationBell />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 text-sm font-medium ${scrolled ? 'text-text-primary' : 'text-white'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-floating border border-border py-1 animate-fade-in">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface" onClick={() => setDropdownOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface" onClick={() => setDropdownOpen(false)}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-surface">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signup" className={`text-sm font-medium border rounded-lg px-3 py-1.5 transition ${
                  scrolled ? 'border-border text-text-primary hover:bg-surface' : 'border-white/30 text-white hover:bg-white/10'
                }`}>Sign Up</Link>
                <Link href="/login" className={`text-sm font-medium transition ${
                  scrolled ? 'text-primary hover:text-accent' : 'text-blue-100 hover:text-white'
                }`}>Log In</Link>
              </>
            )}
          </div>

          <button
            className={`md:hidden p-2 ${scrolled ? 'text-primary' : 'text-white'}`}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="w-72 bg-white h-full flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-accent" />
                <div className="flex flex-col leading-tight">
                  <span className="font-display font-semibold text-primary">Maritime AI Guide</span>
                  <span className="text-[10px] font-medium text-text-muted tracking-wide">Made by Aarush Narula</span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="flex-1 py-4 overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-5 py-3 text-sm font-medium transition ${
                    pathname === link.href ? 'text-accent bg-blue-50' : 'text-text-primary hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <p className="px-5 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Resources</p>
                {RESOURCES_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-text-primary hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-border space-y-3">
              <Link href="/eligibility" className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-full w-full" onClick={() => setMobileOpen(false)}>
                Check My Eligibility →
              </Link>
              <Link href="/advisor" className="flex items-center justify-center gap-2 bg-accent text-primary text-sm font-semibold py-2.5 rounded-full w-full" onClick={() => setMobileOpen(false)}>
                <Sparkles className="w-4 h-4" /> Ask NavAI
              </Link>
              {user ? (
                <button onClick={handleLogout} className="w-full text-sm text-danger text-center py-2">
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/signup" className="flex-1 text-center text-sm font-medium border border-border rounded-lg py-2 hover:bg-surface" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  <Link href="/login" className="flex-1 text-center text-sm font-medium text-accent py-2" onClick={() => setMobileOpen(false)}>Log In</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
