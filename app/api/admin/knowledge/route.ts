import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'all'
  const confidence = searchParams.get('confidence') ?? 'all'
  const embedding = searchParams.get('embedding') ?? 'all'

  let query = db
    .from('knowledge_base')
    .select('id, title, category, confidence_level, source_document, updated_at, is_active, embedding', {
      count: 'exact',
    })
    .order('updated_at', { ascending: false })

  if (category !== 'all') query = query.eq('category', category)
  if (confidence !== 'all') query = query.eq('confidence_level', confidence)
  if (embedding === 'yes') query = query.not('embedding', 'is', null)
  if (embedding === 'no') query = query.is('embedding', null)

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const { count: totalCount } = await db
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })

  const { count: activeCount } = await db
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: lastUpdatedRow } = await db
    .from('knowledge_base')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const chunks = ((data ?? []) as {
    id: string
    title: string
    category: string
    confidence_level: string
    source_document: string | null
    updated_at: string
    is_active: boolean
    embedding: unknown
  }[]).map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    confidence_level: c.confidence_level,
    source_document: c.source_document,
    last_verified_at: c.updated_at,
    has_embedding: c.embedding !== null,
    is_active: c.is_active,
  }))

  const withEmbeddings = chunks.filter((c) => c.has_embedding).length

  return NextResponse.json({
    chunks,
    total: count ?? 0,
    stats: {
      total: totalCount ?? 0,
      active: activeCount ?? 0,
      with_embeddings: withEmbeddings,
      last_updated: (lastUpdatedRow as { updated_at: string } | null)?.updated_at ?? null,
    },
  })
}

export async function POST(request: Request) {
  const { user: admin, error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const body = await request.json() as Record<string, unknown>

  const { data, error: insertError } = await db
    .from('knowledge_base')
    .insert({
      title: body.title,
      category: body.category,
      content: body.content,
      source_document: body.source_document || null,
      source_section: body.source_section || null,
      confidence_level: body.confidence_level ?? 'medium',
      is_active: body.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  const newId = (data as { id: string }).id

  await db.from('admin_audit_log').insert({
    admin_id: admin.id,
    action: 'create_knowledge_chunk',
    table_name: 'knowledge_base',
    record_id: newId,
    new_data: body,
  })

  void fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/admin/knowledge/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
    },
  }).catch(() => {})

  return NextResponse.json({ id: newId })
}
