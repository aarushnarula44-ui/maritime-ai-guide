import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  const { id } = params

  const { data: session } = await supabase
    .from('ai_sessions')
    .select('id, created_at, user_id, metadata')
    .eq('id', id)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const { data: messages } = await supabase
    .from('ai_messages')
    .select('id, role, content, tokens_used, created_at')
    .eq('session_id', id)
    .order('created_at')

  return NextResponse.json({ session, messages: messages ?? [] })
}
