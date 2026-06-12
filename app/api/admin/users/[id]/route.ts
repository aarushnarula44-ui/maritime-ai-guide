import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

const VALID_ROLES = ['student', 'college_partner', 'company_partner', 'admin', 'super_admin']

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  const { id } = params

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: academic } = await supabase
    .from('academic_profiles')
    .select('*')
    .eq('user_id', id)
    .single()

  // Stats
  const [
    { count: eligCount },
    { count: aiCount },
    { count: mockCount },
    { count: savedCourses },
    { count: savedColleges },
  ] = await Promise.all([
    supabase.from('eligibility_checks').select('*', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('ai_messages').select('ai_sessions!inner(user_id)', { count: 'exact', head: true }).eq('ai_sessions.user_id', id),
    supabase.from('mock_test_attempts').select('*', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('user_saved_courses').select('*', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('user_saved_colleges').select('*', { count: 'exact', head: true }).eq('user_id', id),
  ])

  // Recent analytics events
  const { data: recentRaw } = await supabase
    .from('analytics_events')
    .select('id, event_name, properties, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentEvents = ((recentRaw ?? []) as {
    id: string
    event_name: string
    properties: Record<string, unknown> | null
    created_at: string
  }[]).map((r) => ({
    id: r.id,
    time: new Date(r.created_at).toLocaleString(),
    event: r.event_name,
    page: (r.properties?.page as string) || '—',
  }))

  void admin

  return NextResponse.json({
    ...(profile as Record<string, unknown>),
    academic: academic ?? null,
    stats: {
      eligibility_checks: eligCount ?? 0,
      ai_messages: aiCount ?? 0,
      mock_tests: mockCount ?? 0,
      saved_courses: savedCourses ?? 0,
      saved_colleges: savedColleges ?? 0,
    },
    recent_events: recentEvents,
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { id } = params
  const body = await request.json() as { role?: string }

  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // super_admin role can only be assigned by super_admin
  if (body.role === 'super_admin' && admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super_admin can assign super_admin role' }, { status: 403 })
  }

  // Get old value for audit
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single()

  const { error: updateError } = await db
    .from('profiles')
    .update({ role: body.role, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Audit log
  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_user_role',
    table_name: 'profiles',
    record_id: id,
    old_data: { role: (oldProfile as { role: string } | null)?.role },
    new_data: { role: body.role },
  })

  return NextResponse.json({ success: true })
}
