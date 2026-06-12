import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const pct = z.number().min(0).max(100).nullable().optional()

const academicSchema = z.object({
  qualification: z.enum(['class_10', 'class_11', 'class_12', 'diploma', 'engineering_grad', 'bsc_grad', 'other_grad']).nullable().optional(),
  board_10: z.string().max(100).nullable().optional(),
  board_12: z.string().max(100).nullable().optional(),
  year_of_passing_10: z.number().int().min(1990).max(2030).nullable().optional(),
  year_of_passing_12: z.number().int().min(1990).max(2030).nullable().optional(),
  aggregate_percentage_10: pct,
  english_percentage_10: pct,
  physics_percentage: pct,
  chemistry_percentage: pct,
  maths_percentage: pct,
  english_percentage_12: pct,
  diploma_field: z.string().max(200).nullable().optional(),
  diploma_percentage: pct,
  diploma_english_medium: z.boolean().optional(),
  degree_field: z.string().max(200).nullable().optional(),
  degree_percentage: pct,
  degree_university: z.string().max(200).nullable().optional(),
  degree_english_medium: z.boolean().optional(),
})

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('academic_profiles').select('*').eq('user_id', user.id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = academicSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updateData: Record<string, unknown> = { ...parsed.data }

  const p = parsed.data.physics_percentage
  const c = parsed.data.chemistry_percentage
  const m = parsed.data.maths_percentage
  if (p != null && c != null && m != null) {
    updateData.pcm_percentage = Math.round(((p + c + m) / 3) * 100) / 100
  }
  updateData.updated_at = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: existing } = await sb.from('academic_profiles').select('id').eq('user_id', user.id).maybeSingle()

  let result
  if (existing) {
    result = await sb.from('academic_profiles').update(updateData).eq('user_id', user.id).select().single()
  } else {
    result = await sb.from('academic_profiles').insert({ user_id: user.id, ...updateData }).select().single()
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ data: result.data })
}
