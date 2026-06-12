import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

const VALID_STATUSES = ['pending', 'investigating', 'verified', 'dismissed']

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
  const body = await request.json() as {
    status: string
    admin_notes?: string
    update_college_dgs?: boolean
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data: report } = await supabase
    .from('fraud_reports')
    .select('college_id, status')
    .eq('id', id)
    .single()

  const { error: updateError } = await db
    .from('fraud_reports')
    .update({ status: body.status })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const collegeId = (report as { college_id: string | null; status: string } | null)?.college_id

  if (body.status === 'verified' && body.update_college_dgs && collegeId) {
    const { data: oldCollege } = await supabase
      .from('colleges')
      .select('dgs_approval_status')
      .eq('id', collegeId)
      .single()

    await db.from('colleges').update({ dgs_approval_status: 'flagged', updated_at: new Date().toISOString() }).eq('id', collegeId)

    await db.from('admin_audit_log').insert({
      admin_id: admin.id,
      action: 'flag_college_dgs_via_fraud_report',
      table_name: 'colleges',
      record_id: collegeId,
      old_data: { dgs_approval_status: (oldCollege as { dgs_approval_status: string } | null)?.dgs_approval_status },
      new_data: { dgs_approval_status: 'flagged' },
    })
  }

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_fraud_report',
    table_name: 'fraud_reports',
    record_id: id,
    old_data: { status: (report as { status: string } | null)?.status },
    new_data: { status: body.status },
  })

  return NextResponse.json({ success: true })
}
