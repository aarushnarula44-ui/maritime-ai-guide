import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = 25
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') ?? 'all'
  const premium = searchParams.get('premium') ?? 'all'

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, is_premium, created_at, updated_at', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  if (role !== 'all') {
    query = query.eq('role', role)
  }
  if (premium === 'premium') {
    query = query.eq('is_premium', true)
  } else if (premium === 'free') {
    query = query.eq('is_premium', false)
  }

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Get eligibility check counts for users on this page
  const userIds = ((data ?? []) as { id: string }[]).map((u) => u.id)
  const eligCountMap: Record<string, number> = {}
  if (userIds.length > 0) {
    const { data: eligData } = await supabase
      .from('eligibility_checks')
      .select('user_id')
      .in('user_id', userIds)
    for (const row of (eligData ?? []) as { user_id: string }[]) {
      eligCountMap[row.user_id] = (eligCountMap[row.user_id] || 0) + 1
    }
  }

  const users = ((data ?? []) as {
    id: string
    full_name: string | null
    email: string | null
    role: string
    is_premium: boolean
    created_at: string
    updated_at: string
  }[]).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
    is_premium: u.is_premium,
    created_at: u.created_at,
    last_active: u.updated_at,
    eligibility_checks: eligCountMap[u.id] ?? 0,
  }))

  return NextResponse.json({ users, total: count ?? 0, page, pageSize })
}
