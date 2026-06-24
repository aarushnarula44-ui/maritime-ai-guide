import { cosineSimilarity } from './rag'

export interface CachedResponse {
  question: string
  questionEmbedding: number[]
  response: string
  citations: string[]
  cachedAt: string
  expiresAt: string
  hitCount: number
}

async function getKV() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  try {
    const { kv } = await import('@vercel/kv')
    return kv
  } catch {
    return null
  }
}

function hashQuestion(question: string): string {
  let hash = 0
  for (let i = 0; i < question.length; i++) {
    hash = ((hash << 5) - hash + question.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function getCachedResponse(
  questionEmbedding: number[],
  allCachedItems: CachedResponse[],
): CachedResponse | null {
  const THRESHOLD = 0.95
  for (const item of allCachedItems) {
    if (cosineSimilarity(questionEmbedding, item.questionEmbedding) >= THRESHOLD) {
      return item
    }
  }
  return null
}

export async function setCachedResponse(
  question: string,
  questionEmbedding: number[],
  response: string,
  citations: string[],
  ttlHours = 168,
): Promise<void> {
  const kv = await getKV()
  if (!kv) return

  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)
  const key = `ai:cache:${hashQuestion(question)}`

  await kv.set(
    key,
    JSON.stringify({
      question,
      questionEmbedding,
      response,
      citations,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      hitCount: 0,
    }),
    { ex: ttlHours * 3600 },
  )
}

export async function loadResponseCache(): Promise<CachedResponse[]> {
  const kv = await getKV()
  if (!kv) return []

  try {
    const keys = await kv.keys('ai:cache:*')
    if (!keys.length) return []
    const values = await Promise.all(keys.map((k) => kv.get<string>(k)))
    return values
      .filter(Boolean)
      .map((v) => (typeof v === 'string' ? JSON.parse(v) : v)) as CachedResponse[]
  } catch {
    return []
  }
}
