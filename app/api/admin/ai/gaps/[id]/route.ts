import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'

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
  const body = await request.json() as { is_resolved?: boolean }

  const { error: updateError } = await db
    .from('ai_knowledge_gaps')
    .update({ is_resolved: body.is_resolved ?? true })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_knowledge_gap',
    table_name: 'ai_knowledge_gaps',
    record_id: id,
    new_data: { is_resolved: body.is_resolved ?? true },
  })

  return NextResponse.json({ success: true })
}
