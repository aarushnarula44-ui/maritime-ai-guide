import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

const VALID_DGS = ['approved', 'pending', 'suspended', 'not_listed', 'flagged']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { id } = params
  const body = await request.json() as Record<string, unknown>

  if (body.dgs_approval_status && !VALID_DGS.includes(body.dgs_approval_status as string)) {
    return NextResponse.json({ error: 'Invalid dgs_approval_status' }, { status: 400 })
  }

  const { data: oldCollege } = await supabase
    .from('colleges')
    .select('name, dgs_approval_status, city, state, is_partner, is_active')
    .eq('id', id)
    .single()

  const allowed = [
    'name', 'dgs_approval_status', 'city', 'state',
    'address', 'is_partner', 'is_active',
  ]
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key]
  }

  const { error: updateError } = await db.from('colleges').update(updateData).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_college',
    table_name: 'colleges',
    record_id: id,
    old_data: oldCollege,
    new_data: updateData,
  })

  return NextResponse.json({ success: true })
}
