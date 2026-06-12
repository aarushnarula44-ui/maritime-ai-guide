'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Users, Activity, CheckCircle, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'

type Range = '1' | '7' | '30' | '90'

interface OverviewData {
  totalUsers: number
  newToday: number
  dau: number
  dauTrend: number
  eligibilityChecks: number
  eligibilityTrend: number
  aiSessions: number
  aiTrend: number
  userGrowth: { date: string; total: number; new: number }[]
  deviceBreakdown: { name: string; value: number }[]
  topCourses: { name: string; views: number }[]
  funnel: { label: string; count: number }[]
  recentEvents: {
    id: string
    time: string
    event: string
    user: string
    page: string
    device: string
  }[]
  aiCost: { today: number; month: number; budget: number; status: string }
}

const DEVICE_COLORS = ['#00D4FF', '#0A1628', '#64748B']
const RANGES: { label: string; value: Range }[] = [
  { label: 'Today', value: '1' },
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
]

function KpiCard({
  title,
  value,
  trend,
  trendLabel,
  color,
  icon,
}: {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  color: string
  icon: React.ReactNode
}) {
  const positive = (trend ?? 0) >= 0
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
      {trendLabel && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendLabel}
        </p>
      )}
    </div>
  )
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState<Range>('7')
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/overview?days=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-slate-500">Failed to load overview data.</p>
  }

  const costPct = data.aiCost.budget > 0 ? (data.aiCost.today / data.aiCost.budget) * 100 : 0
  const costColor =
    costPct > 80 ? 'text-red-600' : costPct > 50 ? 'text-amber-600' : 'text-green-600'

  return (
    <div className="space-y-6">
      {/* Header + range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Overview</h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r.value
                  ? 'bg-white text-slate-900 shadow-sm font-medium'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={data.totalUsers}
          trend={data.newToday}
          trendLabel={`+${data.newToday} new today`}
          color="bg-cyan-100 text-cyan-600"
          icon={<Users size={18} />}
        />
        <KpiCard
          title="Daily Active Users"
          value={data.dau}
          trend={data.dauTrend}
          trendLabel={`${data.dauTrend >= 0 ? '+' : ''}${data.dauTrend}% vs prev period`}
          color="bg-green-100 text-green-600"
          icon={<Activity size={18} />}
        />
        <KpiCard
          title="Eligibility Checks"
          value={data.eligibilityChecks}
          trend={data.eligibilityTrend}
          trendLabel={`${data.eligibilityTrend >= 0 ? '+' : ''}${data.eligibilityTrend}% vs prev period`}
          color="bg-amber-100 text-amber-600"
          icon={<CheckCircle size={18} />}
        />
        <KpiCard
          title="NavAI Conversations"
          value={data.aiSessions}
          trend={data.aiTrend}
          trendLabel={`${data.aiTrend >= 0 ? '+' : ''}${data.aiTrend}% vs prev period`}
          color="bg-purple-100 text-purple-600"
          icon={<MessageSquare size={18} />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-12 gap-4">
        {/* User Growth */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#0A1628" name="Total Users" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="new" stroke="#00D4FF" name="New Signups" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.deviceBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {data.deviceBreakdown.map((_, i) => (
                  <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-12 gap-4">
        {/* Top Courses */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Courses Viewed</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#00D4FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Eligibility Funnel */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Eligibility Funnel</h3>
          <div className="space-y-3">
            {data.funnel.map((step, i) => {
              const maxCount = data.funnel[0]?.count || 1
              const pct = Math.round((step.count / maxCount) * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{step.label}</span>
                    <span>{step.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Time</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Event</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">User</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Page</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Device</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{ev.time}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{ev.event}</td>
                  <td className="py-2 px-3 text-slate-500">{ev.user}</td>
                  <td className="py-2 px-3 text-slate-500 max-w-[150px] truncate">{ev.page}</td>
                  <td className="py-2 px-3 text-slate-500 capitalize">{ev.device}</td>
                </tr>
              ))}
              {data.recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No recent events</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Cost Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">AI Cost Summary</h3>
          <a href="/admin/ai/costs" className="text-xs text-cyan-600 hover:underline">View Details →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">Today&apos;s Spend</p>
            <p className={`text-xl font-bold ${costColor}`}>${data.aiCost.today.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">This Month</p>
            <p className="text-xl font-bold text-slate-900">${data.aiCost.month.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Daily Budget</p>
            <p className="text-xl font-bold text-slate-900">${data.aiCost.budget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <span
              className={`text-sm font-semibold capitalize ${
                data.aiCost.status === 'exceeded'
                  ? 'text-red-600'
                  : data.aiCost.status === 'warning'
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            >
              {data.aiCost.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
