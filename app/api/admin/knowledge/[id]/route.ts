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
  const body = await request.json() as Record<string, unknown>

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowed = [
    'title', 'category', 'content', 'source_document',
    'source_section', 'confidence_level', 'is_active',
    'last_verified_at', 'expires_at',
  ]
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key] || null
  }

  const { error: updateError } = await db.from('knowledge_base').update(updateData).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_knowledge_chunk',
    table_name: 'knowledge_base',
    record_id: id,
    new_data: updateData,
  })

  // Trigger re-embedding in background
  void fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/knowledge/embed`, {
    method: 'POST',
  }).catch(() => {})

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { id } = params

  const { error: updateError } = await db
    .from('knowledge_base')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'delete_knowledge_chunk',
    table_name: 'knowledge_base',
    record_id: id,
    new_data: { is_active: false },
  })

  return NextResponse.json({ success: true })
}
