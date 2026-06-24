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

  const { data, count } = await supabase
    .from('ai_sessions')
    .select('id, created_at, session_type', { count: 'exact' })
    .eq('session_type', 'navai_chat')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const sessionIds = ((data ?? []) as { id: string }[]).map((s) => s.id)

  // Get message counts per session
  const msgCountMap: Record<string, number> = {}
  if (sessionIds.length > 0) {
    const { data: msgs } = await supabase
      .from('ai_messages')
      .select('session_id')
      .in('session_id', sessionIds)
    for (const m of (msgs ?? []) as { session_id: string }[]) {
      msgCountMap[m.session_id] = (msgCountMap[m.session_id] || 0) + 1
    }
  }

  const sessions = ((data ?? []) as {
    id: string
    created_at: string
  }[]).map((s) => ({
    id: s.id,
    created_at: s.created_at,
    message_count: msgCountMap[s.id] ?? 0,
    avg_response_ms: null,
    user_satisfaction: null,
  }))

  // Stats
  const today = new Date().toISOString().slice(0, 10)
  const { count: todayCount } = await supabase
    .from('ai_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)

  const totalMsgs = Object.values(msgCountMap).reduce((s, c) => s + c, 0)
  const avgMessages = sessions.length > 0 ? totalMsgs / sessions.length : 0

  return NextResponse.json({
    sessions,
    total: count ?? 0,
    stats: {
      today_conversations: todayCount ?? 0,
      avg_messages: avgMessages,
      cache_hit_rate: 0, // Would need dedicated tracking
      avg_response_ms: 0, // Would need dedicated tracking
    },
  })
}
