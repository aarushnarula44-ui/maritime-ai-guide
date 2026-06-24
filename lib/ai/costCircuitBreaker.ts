export type BudgetStatus = 'normal' | 'warning' | 'exceeded'

export interface DailyUsage {
  tokens: number
  cost: number
  date: string
}

function todayKey(): string {
  return `ai:usage:${new Date().toISOString().slice(0, 10)}`
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

// In-memory fallback
let memUsage: DailyUsage | null = null

export async function getDailyUsage(): Promise<DailyUsage> {
  const key = todayKey()
  const date = key.replace('ai:usage:', '')

  const kv = await getKV()
  if (kv) {
    const raw = await kv.get<string>(key)
    if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw
    return { tokens: 0, cost: 0, date }
  }

  if (memUsage?.date === date) return memUsage
  return { tokens: 0, cost: 0, date }
}

export async function recordUsage(
  inputTokens: number,
  outputTokens: number,
  model: string,
): Promise<void> {
  const key = todayKey()
  const date = key.replace('ai:usage:', '')

  let inputCost = 0
  let outputCost = 0
  if (model === 'gpt-4o') {
    inputCost = (inputTokens / 1_000_000) * 5
    outputCost = (outputTokens / 1_000_000) * 15
  } else {
    inputCost = (inputTokens / 1_000_000) * 0.15
    outputCost = (outputTokens / 1_000_000) * 0.60
  }

  const existing = await getDailyUsage()
  const updated: DailyUsage = {
    tokens: existing.tokens + inputTokens + outputTokens,
    cost: existing.cost + inputCost + outputCost,
    date,
  }

  const kv = await getKV()
  if (kv) {
    await kv.set(key, JSON.stringify(updated), { ex: 86400 * 2 })
  } else {
    memUsage = updated
  }
}

export async function getBudgetStatus(): Promise<BudgetStatus> {
  const budget = parseFloat(process.env.OPENAI_DAILY_BUDGET_USD ?? '5')
  const usage = await getDailyUsage()
  const ratio = usage.cost / budget
  if (ratio >= 1) return 'exceeded'
  if (ratio >= 0.8) return 'warning'
  return 'normal'
}

export function selectModel(
  isPremium: boolean,
  complexityScore: number,
  budgetStatus: BudgetStatus,
): 'gpt-4o' | 'gpt-4o-mini' | null {
  if (budgetStatus === 'exceeded') return null
  if (budgetStatus === 'warning') return 'gpt-4o-mini'
  if (isPremium && complexityScore > 0.7) return 'gpt-4o'
  return 'gpt-4o-mini'
}
