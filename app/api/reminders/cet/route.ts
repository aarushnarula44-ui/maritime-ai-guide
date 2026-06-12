import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
}).refine((d) => d.email || d.phone, { message: 'At least email or phone is required' })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  if (user) {
    await sb.from('notifications').insert({
      user_id: user.id,
      type: 'cet_reminder',
      title: 'CET Registration Reminder',
      body: 'IMU CET registration opens soon. Do not miss the deadline!',
    })
  } else {
    await sb.from('leads').insert({
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      source: 'cet_reminder',
    })
  }

  return NextResponse.json({ success: true })
}
