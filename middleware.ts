import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/advisor',
  '/roadmap',
  '/profile',
  '/applications',
  '/cet/practice',
]

const ADMIN_ROUTES = ['/admin']

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isAdmin(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const { pathname } = request.nextUrl

  // Skip Supabase auth when env vars are not configured yet
  if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  if (isAdmin(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Use service role key if available so this check is never blocked by RLS.
    // Falls back to the session client (which works if RLS allows self-reads).
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let adminClient = supabase
    if (serviceRoleKey && supabaseUrl) {
      const { createServerClient } = await import('@supabase/ssr')
      adminClient = createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      })
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Middleware] Admin role check failed:', profileError.message, 'user:', user.id)
    }

    const role = (profile as { role?: string } | null)?.role
    if (!role || !['admin', 'super_admin'].includes(role)) {
      console.warn('[Middleware] Access denied — role:', role ?? 'null', 'user:', user.id)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to onboarding if not completed (only for dashboard, not onboarding itself)
  if (user && pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()
    const p = profile as { onboarding_completed?: boolean } | null
    if (p && p.onboarding_completed === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
