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

/**
 * Fetch the user's role directly via PostgREST using the service role key.
 * Uses native fetch — no Supabase client, works in all runtimes, bypasses RLS.
 */
async function fetchUserRole(supabaseUrl: string, serviceRoleKey: string, userId: string): Promise<string | null> {
  try {
    const url = `${supabaseUrl}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(userId)}&limit=1`
    const res = await fetch(url, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      console.error('MIDDLEWARE ROLE FETCH HTTP ERROR:', res.status, await res.text())
      return null
    }
    const rows = await res.json() as { role?: string }[]
    console.log('MIDDLEWARE ROLE QUERY RESULT:', JSON.stringify(rows))
    return rows[0]?.role ?? null
  } catch (err) {
    console.error('MIDDLEWARE ROLE FETCH EXCEPTION:', err)
    return null
  }
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
      console.log('MIDDLEWARE: no user, redirecting to login')
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let role: string | null = null

    if (serviceRoleKey && supabaseUrl) {
      role = await fetchUserRole(supabaseUrl, serviceRoleKey, user.id)
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (profileError) console.error('MIDDLEWARE FALLBACK QUERY ERROR:', profileError.message)
      role = (profile as { role?: string } | null)?.role ?? null
    }

    if (!role || !['admin', 'super_admin'].includes(role)) {
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
      .maybeSingle()
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
