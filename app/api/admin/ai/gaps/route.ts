import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = 25
  const status = searchParams.get('status') ?? 'all'

  let query = supabase
    .from('ai_knowledge_gaps')
    .select('id, question, frequency, is_resolved, last_asked_at, created_at', { count: 'exact' })
    .order('frequency', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status === 'pending') query = query.eq('is_resolved', false)
  if (status === 'resolved') query = query.eq('is_resolved', true)

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Stat counts
  const { count: totalCount } = await supabase
    .from('ai_knowledge_gaps')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await supabase
    .from('ai_knowledge_gaps')
    .select('*', { count: 'exact', head: true })
    .eq('is_resolved', false)

  const { count: resolvedCount } = await supabase
    .from('ai_knowledge_gaps')
    .select('*', { count: 'exact', head: true })
    .eq('is_resolved', true)

  return NextResponse.json({
    gaps: data ?? [],
    total: count ?? 0,
    stats: {
      total: totalCount ?? 0,
      pending: pendingCount ?? 0,
      resolved: resolvedCount ?? 0,
    },
  })
}
