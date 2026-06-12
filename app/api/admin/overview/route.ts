import { NextResponse } from 'next/server'
import { requireAdmin, getSupabase } from '@/lib/supabase/admin-auth'
import { getDailyUsage, getBudgetStatus } from '@/lib/ai/costCircuitBreaker'
import { format, subDays } from 'date-fns'

export const revalidate = 300 // 5 minute cache

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error) return error

  void user
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '7', 10)
  const today = new Date()
  const startDate = format(subDays(today, days - 1), 'yyyy-MM-dd')
  const prevStart = format(subDays(today, days * 2 - 1), 'yyyy-MM-dd')
  const prevEnd = format(subDays(today, days), 'yyyy-MM-dd')
  const todayStr = format(today, 'yyyy-MM-dd')

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // New signups today
  const { count: newToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStr)

  // Daily stats for range
  const { data: dailyStats } = await supabase
    .from('daily_stats')
    .select('date, new_signups, eligibility_checks, ai_messages')
    .gte('date', startDate)
    .lte('date', todayStr)
    .order('date')

  const { data: prevStats } = await supabase
    .from('daily_stats')
    .select('date, new_signups, eligibility_checks, ai_messages')
    .gte('date', prevStart)
    .lte('date', prevEnd)
    .order('date')

  const stats = (dailyStats ?? []) as {
    date: string
    new_signups: number
    eligibility_checks: number
    ai_messages: number
  }[]
  const prev = (prevStats ?? []) as typeof stats

  const sumField = (arr: typeof stats, field: keyof typeof stats[0]) =>
    arr.reduce((s, r) => s + ((r[field] as number) || 0), 0)

  const dau = stats.length > 0 ? Math.round(sumField(stats, 'new_signups') / stats.length) : 0
  const prevDau = prev.length > 0 ? Math.round(sumField(prev, 'new_signups') / prev.length) : 0
  const dauTrend = prevDau > 0 ? Math.round(((dau - prevDau) / prevDau) * 100) : 0

  const eligChecks = sumField(stats, 'eligibility_checks')
  const prevElig = sumField(prev, 'eligibility_checks')
  const eligTrend = prevElig > 0 ? Math.round(((eligChecks - prevElig) / prevElig) * 100) : 0

  // AI sessions count
  const { count: aiSessions } = await supabase
    .from('ai_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)

  const { count: prevAiSessions } = await supabase
    .from('ai_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevStart)
    .lte('created_at', prevEnd)

  const aiTrend =
    (prevAiSessions ?? 0) > 0
      ? Math.round((((aiSessions ?? 0) - (prevAiSessions ?? 0)) / (prevAiSessions ?? 1)) * 100)
      : 0

  // User growth chart — build cumulative from daily stats
  const { data: allDailyStats } = await supabase
    .from('daily_stats')
    .select('date, new_signups')
    .gte('date', startDate)
    .lte('date', todayStr)
    .order('date')

  const baseTotalUsers = (totalUsers ?? 0) - sumField(stats, 'new_signups')
  let running = baseTotalUsers
  const userGrowth = ((allDailyStats ?? []) as { date: string; new_signups: number }[]).map((r) => {
    running += r.new_signups
    return { date: r.date.slice(5), total: running, new: r.new_signups }
  })

  // Device breakdown from analytics_events
  const { data: deviceData } = await supabase
    .from('analytics_events')
    .select('device')
    .gte('created_at', startDate)
    .not('device', 'is', null)
    .limit(5000)

  const deviceCounts: Record<string, number> = {}
  for (const row of (deviceData ?? []) as { device: string }[]) {
    deviceCounts[row.device] = (deviceCounts[row.device] || 0) + 1
  }
  const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

  // Top courses viewed
  const { data: courseEvents } = await supabase
    .from('analytics_events')
    .select('properties')
    .eq('event_name', 'course_detail_viewed')
    .gte('created_at', startDate)
    .limit(2000)

  const courseCounts: Record<string, number> = {}
  for (const row of (courseEvents ?? []) as { properties: Record<string, unknown> | null }[]) {
    const name = (row.properties?.course_name as string) || 'Unknown'
    courseCounts[name] = (courseCounts[name] || 0) + 1
  }
  const topCourses = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, views]) => ({ name, views }))

  // Eligibility funnel (approximations from analytics events)
  const funnelEvents = [
    'eligibility_page_viewed',
    'eligibility_checker_started',
    'eligibility_check_completed',
    'signup_after_eligibility',
  ]
  const funnelLabels = [
    'Visited /eligibility',
    'Started checker',
    'Completed checker',
    'Signed up after',
  ]
  const funnelCounts: number[] = []
  for (const eventName of funnelEvents) {
    const { count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', eventName)
      .gte('created_at', startDate)
    funnelCounts.push(count ?? 0)
  }
  const funnel = funnelLabels.map((label, i) => ({ label, count: funnelCounts[i] }))

  // Recent activity
  const { data: recentRaw } = await supabase
    .from('analytics_events')
    .select('id, event_name, user_id, properties, device, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const recentEvents = ((recentRaw ?? []) as {
    id: string
    event_name: string
    user_id: string | null
    properties: Record<string, unknown> | null
    device: string | null
    created_at: string
  }[]).map((r) => ({
    id: r.id,
    time: new Date(r.created_at).toLocaleTimeString(),
    event: r.event_name,
    user: r.user_id ? r.user_id.slice(0, 8) + '…' : 'Anonymous',
    page: (r.properties?.page as string) || '—',
    device: r.device || '—',
  }))

  // AI cost
  const usage = await getDailyUsage()
  const budgetStatus = await getBudgetStatus()
  const budget = parseFloat(process.env.OPENAI_DAILY_BUDGET_USD ?? '5')

  // Month spend: sum daily_stats ai_messages (approximation) — KV doesn't store historical
  const thisMonthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
  const { data: monthStats } = await supabase
    .from('daily_stats')
    .select('ai_messages')
    .gte('date', thisMonthStart)
  const monthMessages = ((monthStats ?? []) as { ai_messages: number }[]).reduce(
    (s, r) => s + r.ai_messages,
    0,
  )
  // Very rough estimate: average cost per message ≈ today's cost / today's messages
  const todayMessages = sumField(stats.filter((s) => s.date === todayStr), 'ai_messages') || 1
  const costPerMessage = usage.cost / todayMessages
  const monthEstimate = monthMessages * costPerMessage

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    newToday: newToday ?? 0,
    dau,
    dauTrend,
    eligibilityChecks: eligChecks,
    eligibilityTrend: eligTrend,
    aiSessions: aiSessions ?? 0,
    aiTrend,
    userGrowth,
    deviceBreakdown,
    topCourses,
    funnel,
    recentEvents,
    aiCost: {
      today: usage.cost,
      month: monthEstimate,
      budget,
      status: budgetStatus,
    },
  })
}
