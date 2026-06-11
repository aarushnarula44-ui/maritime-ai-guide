import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { containsInjection, classifyIntent } from '@/lib/ai/intentClassifier'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { getKnowledgeFromCache } from '@/lib/ai/knowledgeCache'
import { retrieveRelevantChunks, formatChunksAsContext } from '@/lib/ai/rag'
import { buildNavAIPrompt } from '@/lib/ai/promptBuilder'
import { getRecentMessages } from '@/lib/ai/conversationManager'
import type { UserProfileSummary } from '@/lib/ai/conversationManager'
import { getCachedResponse, setCachedResponse, loadResponseCache } from '@/lib/ai/responseCache'
import { getBudgetStatus, recordUsage, selectModel } from '@/lib/ai/costCircuitBreaker'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// In-memory rate limit store (per-process; fine for edge/serverless)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, maxPerHour: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 3600_000 })
    return true
  }
  if (entry.count >= maxPerHour) return false
  entry.count++
  return true
}

function sseChunk(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

function makeStream(generator: AsyncGenerator<string>) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of generator) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

async function* pipeline(req: NextRequest): AsyncGenerator<string> {
  // STEP A — Input validation
  let body: { message?: string; sessionId?: string; pageContext?: string; language?: string }
  try {
    body = await req.json()
  } catch {
    yield sseChunk({ type: 'error', message: 'Invalid request body.' })
    return
  }

  const { message = '', sessionId, pageContext, language = 'en' } = body
  const lang = language === 'hi' ? 'hi' : 'en'

  if (!message || message.length > 500) {
    yield sseChunk({ type: 'error', message: 'Message must be between 1 and 500 characters.' })
    return
  }

  if (containsInjection(message)) {
    yield sseChunk({ type: 'chunk', content: 'I am NavAI, your maritime career advisor. I can only help with maritime career questions in India.' })
    yield sseChunk({ type: 'done' })
    return
  }

  // STEP B — Rate limiting
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const rateLimitKey = user ? `user:${user.id}` : `ip:${req.headers.get('x-forwarded-for') ?? 'unknown'}`
  const maxPerHour = user ? 20 : 5

  if (!checkRateLimit(rateLimitKey, maxPerHour)) {
    yield sseChunk({ type: 'error', message: 'Rate limit exceeded. Please try again later.' })
    return
  }

  // STEP C — User profile
  let userProfile: UserProfileSummary | null = null
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const [{ data: academic }, { data: prefs }] = await Promise.all([
      sb.from('academic_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      sb.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
    ])
    if (academic) {
      const dob = academic.date_of_birth ? new Date(academic.date_of_birth) : null
      const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null
      userProfile = {
        qualification: academic.qualification ?? '',
        pcmAverage: academic.pcm_percentage,
        age,
        category: academic.category ?? '',
        targetDepartment: prefs?.target_department ?? null,
      }
    }
  }

  // STEP D — Intent classification
  const intent = classifyIntent(message)

  if (intent === 'out_of_scope') {
    const reply = 'I am NavAI, your maritime career advisor. I can only help with questions about merchant navy careers in India. What would you like to know?'
    yield sseChunk({ type: 'chunk', content: reply })
    yield sseChunk({ type: 'done' })
    await storeMessages(supabase, user?.id, sessionId, message, reply, intent, null, 0, 0)
    return
  }

  // STEP E — Budget check
  const budgetStatus = await getBudgetStatus()

  if (budgetStatus === 'exceeded') {
    const reply = 'NavAI is taking a short break. Please try again later or explore our eligibility checker and course guides directly.'
    yield sseChunk({ type: 'chunk', content: reply })
    yield sseChunk({ type: 'done' })
    return
  }

  // STEP F — Response cache
  let queryEmbedding: number[] = []
  try {
    queryEmbedding = await generateEmbedding(message)
  } catch {
    // proceed without embedding
  }

  if (queryEmbedding.length > 0) {
    const cachedItems = await loadResponseCache()
    const hit = getCachedResponse(queryEmbedding, cachedItems)
    if (hit) {
      yield sseChunk({ type: 'chunk', content: hit.response })
      for (const c of hit.citations) yield sseChunk({ type: 'citation', source: c })
      yield sseChunk({ type: 'done' })
      await storeMessages(supabase, user?.id, sessionId, message, hit.response, intent, 'cache', 0, 0)
      return
    }
  }

  // STEP G — RAG retrieval
  const chunks = await getKnowledgeFromCache()
  const relevantChunks = queryEmbedding.length > 0
    ? retrieveRelevantChunks(queryEmbedding, chunks)
    : []
  const ragContext = formatChunksAsContext(relevantChunks)

  // Track knowledge gaps
  if (relevantChunks.length === 0 && queryEmbedding.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kb = supabase as any
    kb.from('ai_knowledge_gaps').select('id, question, asked_count').then(({ data }: { data: { id: string; question: string; asked_count: number }[] | null }) => {
      const existing = data?.find((row) =>
        row.question.toLowerCase() === message.toLowerCase()
      )
      if (existing) {
        kb.from('ai_knowledge_gaps')
          .update({ asked_count: existing.asked_count + 1, last_asked_at: new Date().toISOString() })
          .eq('id', existing.id)
          .then(() => {})
      } else {
        kb.from('ai_knowledge_gaps')
          .insert({ question: message, asked_count: 1, last_asked_at: new Date().toISOString() })
          .then(() => {})
      }
    })
  }

  // STEP H — Factual lookup from RAG only
  if (intent === 'factual_lookup' && relevantChunks.length > 0) {
    const citations = relevantChunks.map((c) => `${c.sourceDocument}, ${c.sourceSection}`)
    const reply = `${relevantChunks[0].content}\n\n📋 Source: ${citations[0]}`
    yield sseChunk({ type: 'chunk', content: reply })
    for (const c of citations) yield sseChunk({ type: 'citation', source: c })
    yield sseChunk({ type: 'done' })
    await setCachedResponse(message, queryEmbedding, reply, citations)
    await storeMessages(supabase, user?.id, sessionId, message, reply, intent, 'rag', 0, 0)
    return
  }

  // STEP I — OpenAI call
  const history = sessionId ? await fetchSessionHistory(supabase, sessionId) : []
  const recentHistory = getRecentMessages(history)

  const promptMessages = buildNavAIPrompt({
    userMessage: message,
    userProfile,
    ragContext,
    conversationHistory: recentHistory,
    pageContext: pageContext ?? null,
    language: lang,
  })

  const isPremium = false
  const complexityScore = message.length > 200 ? 0.8 : 0.4
  const model = selectModel(isPremium, complexityScore, budgetStatus) ?? 'gpt-4o-mini'

  let fullResponse = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: promptMessages as OpenAI.Chat.ChatCompletionMessageParam[],
      stream: true,
      max_tokens: 400,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        fullResponse += delta
        yield sseChunk({ type: 'chunk', content: delta })
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens
        outputTokens = chunk.usage.completion_tokens
      }
    }
  } catch (err) {
    yield sseChunk({ type: 'error', message: 'NavAI encountered an error. Please try again.' })
    console.error('OpenAI error:', err)
    return
  }

  // STEP J — Post processing
  const citations = relevantChunks.map((c) => `${c.sourceDocument}, ${c.sourceSection}`)
  for (const c of citations) yield sseChunk({ type: 'citation', source: c })
  yield sseChunk({ type: 'done' })

  if (intent === 'factual_lookup' || intent === 'conversational') {
    await setCachedResponse(message, queryEmbedding, fullResponse, citations)
  }
  await recordUsage(inputTokens, outputTokens, model)

  // STEP K — Store in database
  await storeMessages(supabase, user?.id, sessionId, message, fullResponse, intent, model, inputTokens, outputTokens)
}

type SupabaseClient = ReturnType<typeof createClient>

async function fetchSessionHistory(supabase: SupabaseClient, sessionId: string) {
  const { data } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20)
  return (data ?? []) as { role: 'user' | 'assistant' | 'system'; content: string }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function storeMessages(supabase: SupabaseClient, userId: string | undefined, sessionId: string | undefined, userMessage: string, assistantMessage: string, ..._rest: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  let sid = sessionId
  if (!sid) {
    const { data } = await sb
      .from('ai_sessions')
      .insert({ user_id: userId ?? null, session_type: 'navai_chat' })
      .select('id')
      .single()
    sid = data?.id
  } else {
    await sb
      .from('ai_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sid)
  }

  if (!sid) return

  await sb.from('ai_messages').insert([
    {
      session_id: sid,
      role: 'user',
      content: userMessage,
    },
    {
      session_id: sid,
      role: 'assistant',
      content: assistantMessage,
    },
  ])
}

export async function POST(req: NextRequest) {
  return makeStream(pipeline(req))
}
