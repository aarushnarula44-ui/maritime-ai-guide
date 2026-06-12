import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin('super_admin')
  if (error) return error
  void user

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = 50
  const adminFilter = searchParams.get('admin_id') ?? ''
  const actionFilter = searchParams.get('action') ?? ''
  const tableFilter = searchParams.get('table') ?? ''
  const dateFrom = searchParams.get('date_from') ?? ''
  const dateTo = searchParams.get('date_to') ?? ''

  let query = supabase
    .from('admin_audit_log')
    .select(
      `id, action, table_name, record_id, old_data, new_data, created_at,
       profiles:admin_id (full_name, email)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (adminFilter) query = query.eq('admin_id', adminFilter)
  if (actionFilter) query = query.ilike('action', `%${actionFilter}%`)
  if (tableFilter) query = query.eq('table_name', tableFilter)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z')

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Get list of admin users for filter dropdown
  const { data: adminUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('role', ['admin', 'super_admin'])

  return NextResponse.json({
    entries: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    adminUsers: adminUsers ?? [],
  })
}
