import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'admin' | 'super_admin'

interface AdminUser {
  id: string
  role: AdminRole
}

/**
 * Verifies the requesting user has an admin role.
 * Returns the user + role if authorized, or a NextResponse error to return immediately.
 */
export async function requireAdmin(
  minRole: 'admin' | 'super_admin' = 'admin',
): Promise<{ user: AdminUser; error: null } | { user: null; error: NextResponse }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role

  const allowed =
    minRole === 'super_admin'
      ? role === 'super_admin'
      : role === 'admin' || role === 'super_admin'

  if (!allowed) {
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
