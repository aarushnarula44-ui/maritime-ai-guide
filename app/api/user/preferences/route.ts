import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const schema = z.object({
  target_department: z.enum(['deck', 'engine', 'eto', 'ratings', 'undecided']).nullable().optional(),
  priority: z.enum(['fastest', 'highest_salary', 'lowest_cost', 'work_life_balance']).nullable().optional(),
  email_notifications: z.boolean().optional(),
  digest_frequency: z.enum(['daily', 'weekly', 'never']).optional(),
})

export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: existing } = await sb.from('user_preferences').select('id').eq('user_id', user.id).maybeSingle()

  let result
  if (existing) {
    result = await sb.from('user_preferences').update({ ...parsed.data, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()
  } else {
    result = await sb.from('user_preferences').insert({ user_id: user.id, ...parsed.data }).select().single()
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ data: result.data })
}
