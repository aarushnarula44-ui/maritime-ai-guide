import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export type AdminRole = 'admin' | 'super_admin'

interface AdminUser {
  id: string
  role: AdminRole
}

/**
 * Verifies the requesting user has an admin role.
 * Returns the user + role if authorized, or a NextResponse error to return immediately.
 *
 * Uses the service role key for the profiles query so RLS can never block it.
 */
export async function requireAdmin(
  minRole: 'admin' | 'super_admin' = 'admin',
): Promise<{ user: AdminUser; error: null } | { user: null; error: NextResponse }> {
  // 1. Verify the session using the user's own client (validates JWT)
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    if (authError) console.error('[requireAdmin] auth.getUser error:', authError.message)
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // 2. Fetch the role using the service role client — bypasses RLS, always works
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  let role: string | undefined

  if (supabaseUrl && serviceRoleKey) {
    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[requireAdmin] profile query error:', profileError.message, 'user:', user.id)
    }
    role = (profile as { role?: string } | null)?.role
  } else {
    // Fallback: use session client (requires RLS policy allowing self-reads)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[requireAdmin] profile fallback query error:', profileError.message)
    }
    role = (profile as { role?: string } | null)?.role
  }

  const allowed =
    minRole === 'super_admin'
      ? role === 'super_admin'
      : role === 'admin' || role === 'super_admin'

  if (!allowed) {
    console.warn('[requireAdmin] Forbidden — role:', role ?? 'null', 'user:', user.id)
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { user: { id: user.id, role: role as AdminRole }, error: null }
}

export function getSupabase() {
  return createClient()
}
