import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabase
    .from('ai_sessions')
    .select('id, user_id, created_at, updated_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: messages } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('session_id', params.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ session, messages: messages ?? [] })
}
