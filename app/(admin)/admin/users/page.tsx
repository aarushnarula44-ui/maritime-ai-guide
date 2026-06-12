'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  role: string
  is_premium: boolean
  created_at: string
  last_active: string | null
  eligibility_checks: number
}

interface UsersResponse {
  users: UserRow[]
  total: number
  page: number
  pageSize: number
}

const ROLES = ['all', 'student', 'admin', 'college_partner', 'company_partner']
const PREMIUM = ['all', 'premium', 'free']

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [premium, setPremium] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      search,
      role,
      premium,
    })
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, search, role, premium])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.ceil(data.total / (data.pageSize || 25)) : 1

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900">Users</h2>
        {data && (
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {data.total.toLocaleString()} total
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={premium}
          onChange={(e) => { setPremium(e.target.value); setPage(1) }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {PREMIUM.map((p) => (
            <option key={p} value={p}>{p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Joined</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Last Active</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Checks</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td>
                </tr>
              )}
              {!loading && data?.users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">
                        {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{u.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.is_premium ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Premium</span>
                    ) : (
                      <span className="text-xs text-slate-400">Free</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {u.last_active ? new Date(u.last_active).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.eligibility_checks}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs text-cyan-600 hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && data?.users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
