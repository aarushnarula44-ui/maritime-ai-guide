'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AiSession {
  id: string
  created_at: string
  message_count: number
  avg_response_ms: number | null
  user_satisfaction: number | null
}

interface SessionsResponse {
  sessions: AiSession[]
  total: number
  stats: {
    today_conversations: number
    avg_messages: number
    cache_hit_rate: number
    avg_response_ms: number
  }
}

export default function AiLogsPage() {
  const [data, setData] = useState<SessionsResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/ai/sessions?page=${page}&type=navai_chat`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.ceil(data.total / 25) : 1

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">NavAI Conversation Logs</h2>
        <p className="text-sm text-slate-500 mt-1">
          User messages are shown for quality monitoring. Handle with discretion.
        </p>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Today's Conversations", data.stats.today_conversations],
            ['Avg Messages/Session', data.stats.avg_messages.toFixed(1)],
            ['Cache Hit Rate', `${data.stats.cache_hit_rate.toFixed(1)}%`],
            ['Avg Response Time', `${data.stats.avg_response_ms.toFixed(0)}ms`],
          ].map(([label, val]) => (
            <div key={label as string} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Session ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Started</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Messages</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Avg Response</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Rating</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && data?.sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{s.id.slice(0, 12)}…</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{s.message_count}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.avg_response_ms ? `${s.avg_response_ms.toFixed(0)}ms` : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.user_satisfaction ? `${s.user_satisfaction}/5` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/ai/logs/${s.id}`} className="text-xs text-cyan-600 hover:underline">
                      View Session →
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && data?.sessions.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No sessions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
