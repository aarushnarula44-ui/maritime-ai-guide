import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
import { getDailyUsage, getBudgetStatus } from '@/lib/ai/costCircuitBreaker'
import { format, subDays } from 'date-fns'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error) return error
  void user

  const supabase = getSupabase()
  const usage = await getDailyUsage()
  const budgetStatus = await getBudgetStatus()
  const budget = parseFloat(process.env.OPENAI_DAILY_BUDGET_USD ?? '5')

  // 7-day history from KV (best effort — store daily keys)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let kv: any | null = null
  try {
    const mod = await import('@vercel/kv')
    kv = mod.kv
  } catch {
    kv = null
  }

  const sevenDayHistory: { date: string; cost: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    let cost = 0
    if (kv) {
      try {
        const raw = await kv.get(`ai:usage:${date}`) as string | null
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as { cost: number } : null
        cost = parsed?.cost ?? 0
      } catch {
        cost = 0
      }
    }
    if (date === usage.date) cost = usage.cost
    sevenDayHistory.push({ date: date.slice(5), cost })
  }

  // Month spend estimate from daily_stats
  const today = new Date()
  const thisMonthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
  const { data: monthStats } = await supabase
    .from('daily_stats')
    .select('ai_messages')
    .gte('date', thisMonthStart)
  const monthMessages = ((monthStats ?? []) as { ai_messages: number }[]).reduce(
    (s, r) => s + r.ai_messages,
    0,
  )
  const { data: todayStats } = await supabase
    .from('daily_stats')
    .select('ai_messages')
    .eq('date', usage.date)
    .single()
  const todayMessages = Math.max((todayStats as { ai_messages: number } | null)?.ai_messages ?? 1, 1)
  const costPerMsg = usage.cost / todayMessages
  const monthEstimate = monthMessages * costPerMsg

  // Projections
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: todaySessions } = await supabase
    .from('ai_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', usage.date)

  const costPerConversation = (todaySessions ?? 0) > 0 ? usage.cost / (todaySessions ?? 1) : 0
  const costPerUserPerDay = (totalUsers ?? 0) > 0 ? usage.cost / (totalUsers ?? 1) : 0
  const remainingBudget = budget - usage.cost
  const daysAtCurrentRate =
    usage.cost > 0 ? Math.floor(remainingBudget / usage.cost) : 999

  return NextResponse.json({
    today: {
      spend: usage.cost,
      budget,
      remaining: remainingBudget,
      pct: budget > 0 ? (usage.cost / budget) * 100 : 0,
      status: budgetStatus,
    },
    sevenDayHistory,
    projections: {
      monthEstimate,
      daysAtCurrentRate,
      costPerConversation,
      costPerUserPerDay,
    },
    // Model breakdown requires per-model KV tracking — show totals only for now
    models: {
      gpt4o: { tokens: 0, cost: 0 },
      gpt4omini: { tokens: usage.tokens, cost: usage.cost },
      cacheHits: 0,
      cacheSaved: 0,
    },
  })
}
