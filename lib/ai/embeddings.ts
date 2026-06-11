import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function generateAndStoreEmbeddings(): Promise<void> {
  const supabase = createClient()

  const { data: rows, error } = await supabase
    .from('knowledge_base')
    .select('id, content')
    .is('embedding', null)

  if (error || !rows) {
    console.error('Failed to fetch knowledge_base rows:', error)
    return
  }

  let embedded = 0
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const embedding = await generateEmbedding(row.content)
      await supabase
        .from('knowledge_base')
        .update({ embedding: JSON.stringify(embedding) })
        .eq('id', row.id)
      embedded++
      console.log(`Embedded ${embedded} of ${rows.length} chunks`)
      await new Promise((r) => setTimeout(r, 100))
    } catch (err) {
      console.error(`Failed to embed chunk ${row.id}:`, err)
    }
  }
}
