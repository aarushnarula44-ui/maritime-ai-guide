import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()

  const { data, error: dbError } = await supabase
    .from('fraud_reports')
    .select(`
      id,
      college_id,
      fraud_type,
      description,
      status,
      created_at,
      reported_by,
      colleges (name)
    `)
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const reports = ((data ?? []) as {
    id: string
    college_id: string
    fraud_type: string
    description: string | null
    status: string
    created_at: string
    reported_by: string | null
    colleges: { name: string } | null
  }[]).map((r) => ({
    id: r.id,
    college_id: r.college_id,
    college_name: r.colleges?.name ?? 'Unknown College',
    report_type: r.fraud_type,
    description: r.description,
    reporter: r.reported_by ? r.reported_by.slice(0, 8) + '…' : 'Anonymous',
    status: r.status,
    admin_notes: '',
    created_at: r.created_at,
  }))

  return NextResponse.json({ reports })
}
