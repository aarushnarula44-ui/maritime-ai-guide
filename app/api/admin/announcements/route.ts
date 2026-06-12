import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error: dbError } = await db
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ announcements: data ?? [] })
}

export async function POST(request: Request) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const body = await request.json() as {
    title: string
    body: string
    type: string
    audience: string
    publish_immediately?: boolean
    expires_at?: string
  }

  const publishedAt = body.publish_immediately ? new Date().toISOString() : null

  const { data: announcement, error: insertError } = await db
    .from('announcements')
    .insert({
      title: body.title,
      body: body.body,
      type: body.type,
      audience: body.audience,
      is_active: !!body.publish_immediately,
      published_at: publishedAt,
      expires_at: body.expires_at || null,
    })
    .select('id')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  if (body.publish_immediately) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profileQuery = (supabase as any).from('profiles').select('id').eq('is_active', true)
    if (body.audience === 'premium') {
      profileQuery = profileQuery.eq('is_premium', true)
    }
    const { data: targetUsers } = await profileQuery.limit(10000)
    const users = (targetUsers ?? []) as { id: string }[]

    if (users.length > 0) {
      type NotifType = 'cet_reminder' | 'eligibility_update' | 'sponsorship_open' | 'system' | 'fraud_alert'
      const notifications = users.map((u) => ({
        user_id: u.id,
        type: 'system' as NotifType,
        title: body.title,
        body: body.body,
        is_read: false,
      }))
      for (let i = 0; i < notifications.length; i += 500) {
        await db.from('notifications').insert(notifications.slice(i, i + 500))
      }
    }
  }

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'create_announcement',
    table_name: 'announcements',
    record_id: (announcement as { id: string }).id,
    new_data: { title: body.title, type: body.type, audience: body.audience },
  })

  return NextResponse.json({ id: (announcement as { id: string }).id })
}

export async function PATCH(request: Request) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const body = await request.json() as Record<string, unknown> & { id: string }
  const { id, ...rest } = body

  const updateData: Record<string, unknown> = {}
  for (const key of ['title', 'body', 'type', 'audience', 'is_active', 'expires_at', 'published_at']) {
    if (key in rest) updateData[key] = rest[key]
  }

  const { error: updateError } = await db.from('announcements').update(updateData).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'update_announcement',
    table_name: 'announcements',
    record_id: id,
    new_data: updateData,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.from('announcements').update({ is_active: false }).eq('id', id)

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'delete_announcement',
    table_name: 'announcements',
    record_id: id,
  })

  return NextResponse.json({ success: true })
}
