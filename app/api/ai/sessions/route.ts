import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const limit = 10
  const from = (page - 1) * limit

  const { data: sessions, error } = await supabase
    .from('ai_sessions')
    .select('id, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('session_type', 'navai_chat')
    .order('updated_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch first message for each session
  const enriched = await Promise.all(
    (sessions ?? []).map(async (s) => {
      const { data: msgs } = await supabase
        .from('ai_messages')
        .select('content, role')
        .eq('session_id', s.id)
        .eq('role', 'user')
        .order('created_at', { ascending: true })
        .limit(1)

      const { count } = await supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', s.id)

      return {
        ...s,
        first_message_preview: msgs?.[0]?.content?.slice(0, 80) ?? '',
        message_count: count ?? 0,
      }
    }),
  )

  return NextResponse.json({ sessions: enriched, page })
}
