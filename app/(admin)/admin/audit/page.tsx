'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditEntry {
  id: string
  action: string
  table_name: string | null
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

interface AuditResponse {
  entries: AuditEntry[]
  total: number
  adminUsers: { id: string; full_name: string | null; email: string | null }[]
}

export default function AuditLogPage() {
  const [data, setData] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [adminFilter, setAdminFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [diffEntry, setDiffEntry] = useState<AuditEntry | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  // Check super_admin role client-side too
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = (profile as { role: string } | null)?.role
      if (role !== 'super_admin') {
        router.push('/dashboard')
      } else {
        setAuthorized(true)
      }
    })
  }, [router])

  const load = useCallback(() => {
    if (!authorized) return
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      admin_id: adminFilter,
      action: actionFilter,
      table: tableFilter,
      date_from: dateFrom,
      date_to: dateTo,
    })
    fetch(`/api/admin/audit?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authorized, page, adminFilter, actionFilter, tableFilter, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  if (authorized === false) return null
  if (authorized === null) return <div className="text-slate-400 text-sm">Checking access…</div>

  const totalPages = data ? Math.ceil(data.total / 50) : 1

  return (
    <div className="space-y-5 relative">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Audit Log</h2>
        <p className="text-sm text-slate-500 mt-1">Complete record of all admin actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        {data?.adminUsers && (
          <select
            value={adminFilter}
            onChange={(e) => { setAdminFilter(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Admins</option>
            {data.adminUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="text"
          placeholder="Table name…"
          value={tableFilter}
          onChange={(e) => { setTableFilter(e.target.value); setPage(1) }}
          className="w-36 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Timestamp</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Admin</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Action</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Table</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Record ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && data?.entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {entry.profiles?.full_name || entry.profiles?.email || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-700">{entry.action}</td>
                  <td className="py-3 px-4 text-slate-500">{entry.table_name || '—'}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">
                    {entry.record_id ? entry.record_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {(entry.old_data || entry.new_data) && (
                      <button
                        onClick={() => setDiffEntry(entry)}
                        className="text-xs text-cyan-600 hover:underline whitespace-nowrap"
                      >
                        View Changes →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && data?.entries.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No audit entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} · {data.total} entries</p>
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

      {/* Diff Modal */}
      {diffEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDiffEntry(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Changes</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{diffEntry.action}</p>
              </div>
              <button onClick={() => setDiffEntry(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">Before</p>
                <pre className="text-xs bg-red-50 border border-red-100 rounded-lg p-3 overflow-auto whitespace-pre-wrap">
                  {diffEntry.old_data ? JSON.stringify(diffEntry.old_data, null, 2) : 'null'}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">After</p>
                <pre className="text-xs bg-green-50 border border-green-100 rounded-lg p-3 overflow-auto whitespace-pre-wrap">
                  {diffEntry.new_data ? JSON.stringify(diffEntry.new_data, null, 2) : 'null'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
