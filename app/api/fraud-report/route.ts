import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const schema = z.object({
  institute: z.string().min(1).max(300),
  city: z.string().max(100).optional(),
  what: z.string().min(1).max(2000),
  contact: z.string().max(200).optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('fraud_reports').insert({
      college_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      report_type: 'external_report',
      description: JSON.stringify({
        institute: parsed.data.institute,
        city: parsed.data.city,
        what: parsed.data.what,
        contact: parsed.data.contact,
      }),
    })
  } catch {}

  return NextResponse.json({ success: true })
}
