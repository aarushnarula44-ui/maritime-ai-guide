'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

interface CostData {
  today: {
    spend: number
    budget: number
    remaining: number
    pct: number
    status: string
  }
  sevenDayHistory: { date: string; cost: number }[]
  projections: {
    monthEstimate: number
    daysAtCurrentRate: number
    costPerConversation: number
    costPerUserPerDay: number
  }
  models: {
    gpt4o: { tokens: number; cost: number }
    gpt4omini: { tokens: number; cost: number }
    cacheHits: number
    cacheSaved: number
  }
}

export default function AiCostsPage() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [budgetInput, setBudgetInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [adminRole, setAdminRole] = useState('')

  useEffect(() => {
    fetch('/api/admin/ai/costs')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setBudgetInput(d.today.budget.toFixed(2))
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Get admin role for super_admin check
    fetch('/api/admin/users?page=1&search=')
      .then(() => {})
      .catch(() => {})
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile) setAdminRole((profile as { role: string }).role)
      })
    })
  }, [])

  const statusColor =
    !data
      ? 'bg-white'
      : data.today.pct > 80
      ? 'bg-red-50 border-red-200'
      : data.today.pct > 50
      ? 'bg-amber-50 border-amber-200'
      : 'bg-green-50 border-green-200'

  const statusText =
    !data
      ? ''
      : data.today.status === 'exceeded'
      ? 'text-red-700'
      : data.today.status === 'warning'
      ? 'text-amber-700'
      : 'text-green-700'

  async function handleUpdateBudget() {
    setSaving(true)
    // Budget is env-var based — show message
    alert('To update the daily budget, set OPENAI_DAILY_BUDGET_USD in your environment variables and redeploy.')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    )
  }

  if (!data) return <p className="text-slate-500">Failed to load cost data.</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-slate-900">AI Cost Monitor</h2>

      {/* Today's Summary */}
      <div className={`rounded-xl border p-6 ${statusColor}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Today&apos;s Usage</h3>
            <p className={`text-sm font-semibold capitalize mt-1 ${statusText}`}>
              Status: {data.today.status}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">${data.today.spend.toFixed(4)}</p>
            <p className="text-sm text-slate-500">of ${data.today.budget.toFixed(2)} budget</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Usage</span>
            <span>{data.today.pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                data.today.pct > 80 ? 'bg-red-500' : data.today.pct > 50 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(data.today.pct, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-slate-500">Remaining</p>
            <p className="text-lg font-bold text-slate-900">${data.today.remaining.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Daily Budget</p>
            <p className="text-lg font-bold text-slate-900">${data.today.budget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Circuit Breaker</p>
            <p className={`text-lg font-bold capitalize ${statusText}`}>{data.today.status}</p>
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-xs font-semibold text-slate-500 mb-3">GPT-4o</h4>
          <p className="text-2xl font-bold text-slate-900">{data.models.gpt4o.tokens.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">tokens · ${data.models.gpt4o.cost.toFixed(4)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-xs font-semibold text-slate-500 mb-3">GPT-4o-mini</h4>
          <p className="text-2xl font-bold text-slate-900">{data.models.gpt4omini.tokens.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">tokens · ${data.models.gpt4omini.cost.toFixed(4)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-xs font-semibold text-slate-500 mb-3">Cache Hits</h4>
          <p className="text-2xl font-bold text-green-600">{data.models.cacheHits.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">saved ${data.models.cacheSaved.toFixed(4)}</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">7-Day Spend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.sevenDayHistory}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
            <Tooltip formatter={(v: unknown) => [`$${(v as number).toFixed(4)}`, 'Spend']} />
            <ReferenceLine y={data.today.budget} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Budget', fontSize: 10, fill: '#94A3B8' }} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
              {data.sevenDayHistory.map((entry, i) => (
                <Cell key={i} fill={entry.cost > data.today.budget ? '#EF4444' : '#22C55E'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Projections */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Projections</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['This Month Est.', `$${data.projections.monthEstimate.toFixed(2)}`],
            ['Budget Lasts', `${data.projections.daysAtCurrentRate} days`],
            ['Cost / Conversation', `$${data.projections.costPerConversation.toFixed(4)}`],
            ['Cost / User / Day', `$${data.projections.costPerUserPerDay.toFixed(4)}`],
          ].map(([label, val]) => (
            <div key={label as string}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-lg font-bold text-slate-900">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Circuit Breaker Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Circuit Breaker Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Daily Budget (USD)</label>
              <input
                type="number"
                step="0.50"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                disabled={adminRole !== 'super_admin'}
                className="w-32 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <button
              onClick={handleUpdateBudget}
              disabled={saving || adminRole !== 'super_admin'}
              className="mt-5 px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              Update Budget
            </button>
          </div>
          {adminRole !== 'super_admin' && (
            <p className="text-xs text-slate-400">Budget controls are super_admin only.</p>
          )}
        </div>
      </div>
    </div>
  )
}
