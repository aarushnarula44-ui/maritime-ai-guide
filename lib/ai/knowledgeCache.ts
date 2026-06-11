import { createClient } from '@/lib/supabase/server'

export interface KnowledgeChunk {
  id: string
  category: string
  title: string
  content: string
  sourceDocument: string
  sourceSection: string
  confidenceLevel: string
  embedding: number[]
}

// In-memory fallback when Vercel KV is not configured
let memoryCache: KnowledgeChunk[] | null = null
let memoryCacheAt: number | null = null

async function getKV() {
  try {
    const { kv } = await import('@vercel/kv')
    return kv
  } catch {
    return null
  }
}

export async function loadKnowledgeBaseToCache(): Promise<void> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, category, title, content, source_document, source_section, confidence_level, embedding')
    .eq('is_active', true)
    .not('embedding', 'is', null)

  if (error || !data) {
    console.error('Failed to load knowledge base:', error)
    return
  }

  const chunks: KnowledgeChunk[] = data.map((row) => ({
    id: row.id,
    category: row.category ?? '',
    title: row.title ?? '',
    content: row.content,
    sourceDocument: row.source_document ?? '',
    sourceSection: row.source_section ?? '',
    confidenceLevel: row.confidence_level ?? 'high',
    embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : (row.embedding ?? []),
  }))

  const kv = await getKV()
  if (kv) {
    await kv.set('kb:chunks', JSON.stringify(chunks))
    await kv.set('kb:cached_at', new Date().toISOString())
  } else {
    memoryCache = chunks
    memoryCacheAt = Date.now()
  }
}

export async function getKnowledgeFromCache(): Promise<KnowledgeChunk[]> {
  const kv = await getKV()

  if (kv) {
    try {
      const raw = await kv.get<string>('kb:chunks')
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
      // fall through to Supabase
    }
  } else if (memoryCache) {
    return memoryCache
  }

  // Neither cache available — load from Supabase directly
  try {
    await loadKnowledgeBaseToCache()
    if (memoryCache) return memoryCache
  } catch {
    // graceful degradation
  }

  return []
}
