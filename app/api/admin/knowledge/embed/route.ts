import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAndStoreEmbeddings } from '@/lib/ai/embeddings'
export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes((profile as { role: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let embedded = 0
  let failed = 0

  const originalLog = console.log
  console.log = (...args: unknown[]) => {
    const msg = String(args[0])
    const match = msg.match(/Embedded (\d+) of/)
    if (match) embedded = parseInt(match[1])
    originalLog(...args)
  }

  try {
    await generateAndStoreEmbeddings()
  } catch (err) {
    failed++
    console.error(err)
  } finally {
    console.log = originalLog
  }

  return NextResponse.json({ embedded, failed })
}
