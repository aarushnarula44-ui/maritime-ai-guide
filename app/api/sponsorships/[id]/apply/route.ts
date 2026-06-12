import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const schema = z.object({
  appliedDate: z.string().min(1),
  notes: z.string().max(1000).optional(),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_applications')
    .insert({
      user_id: user.id,
      company_name: `sponsorship-program-${params.id}`,
      program_name: params.id,
      applied_date: parsed.data.appliedDate,
      notes: parsed.data.notes ?? null,
      status: 'applied',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
