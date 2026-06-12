import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const dgs = searchParams.get('dgs') ?? 'all'

  let query = supabase
    .from('colleges')
    .select('id, name, city, state, dgs_approval_status, is_partner, is_active, updated_at', {
      count: 'exact',
    })
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
  }
  if (dgs !== 'all') {
    query = query.eq('dgs_approval_status', dgs)
  }

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ colleges: data ?? [], total: count ?? 0 })
}
