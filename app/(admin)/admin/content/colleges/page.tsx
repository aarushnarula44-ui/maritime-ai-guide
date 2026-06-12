'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, X, ExternalLink } from 'lucide-react'

interface CollegeRow {
  id: string
  name: string
  city: string | null
  state: string | null
  dgs_approval_status: string
  is_partner: boolean
  is_active: boolean
  updated_at: string
}

interface CollegesResponse {
  colleges: CollegeRow[]
  total: number
}

interface EditForm {
  name: string
  dgs_approval_status: string
  dgs_approval_number: string
  dgs_last_verified: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website_url: string
  hostel_available: boolean
  is_partner: boolean
  partner_tier: string
  is_active: boolean
}

const DGS_STATUSES = ['approved', 'pending', 'suspended', 'not_listed', 'flagged']
const DGS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  not_listed: 'bg-slate-100 text-slate-600',
  flagged: 'bg-red-100 text-red-800',
}

export default function AdminCollegesPage() {
  const [data, setData] = useState<CollegesResponse | null>(null)
  const [search, setSearch] = useState('')
  const [dgsFilter, setDgsFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CollegeRow | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ search, dgs: dgsFilter })
    fetch(`/api/admin/colleges?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, dgsFilter])

  useEffect(() => { load() }, [load])

  function openEdit(college: CollegeRow) {
    setEditing(college)
    setForm({
      name: college.name,
      dgs_approval_status: college.dgs_approval_status,
      dgs_approval_number: '',
      dgs_last_verified: '',
      city: college.city || '',
      state: college.state || '',
      pincode: '',
      phone: '',
      email: '',
      website_url: '',
      hostel_available: false,
      is_partner: college.is_partner,
      partner_tier: '',
      is_active: college.is_active,
    })
  }

  async function handleSave() {
    if (!editing || !form) return
    setSaving(true)
    const res = await fetch(`/api/admin/colleges/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setToast('College updated successfully')
      setEditing(null)
      load()
    } else {
      setToast('Failed to update college')
    }
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="space-y-5 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Colleges</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={dgsFilter}
          onChange={(e) => setDgsFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All DGS Status</option>
          {DGS_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">College</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Location</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">DGS Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Partner</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Updated</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && data?.colleges.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                  <td className="py-3 px-4 text-slate-500">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${DGS_COLORS[c.dgs_approval_status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.dgs_approval_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.is_partner ? (
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Partner</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{new Date(c.updated_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs text-cyan-600 hover:underline"
                      >
                        Edit
                      </button>
                      <a
                        href={`/colleges/${c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data?.colleges.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No colleges found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit College</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* DGS Status — highlighted */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-amber-800 mb-1">
                  DGS Approval Status *
                </label>
                <select
                  value={form.dgs_approval_status}
                  onChange={(e) => setForm({ ...form, dgs_approval_status: e.target.value })}
                  className="w-full text-sm border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {DGS_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['name', 'College Name', 'text'],
                  ['dgs_approval_number', 'DGS Approval Number', 'text'],
                  ['dgs_last_verified', 'DGS Last Verified', 'date'],
                  ['city', 'City', 'text'],
                  ['state', 'State', 'text'],
                  ['pincode', 'Pincode', 'text'],
                  ['phone', 'Phone', 'text'],
                  ['email', 'Email', 'email'],
                  ['website_url', 'Website URL', 'url'],
                ].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type={type}
                      value={(form as unknown as Record<string, unknown>)[field] as string}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                {([
                  ['hostel_available', 'Hostel Available'],
                  ['is_partner', 'Is Partner'],
                  ['is_active', 'Is Active'],
                ] as [keyof EditForm, string][]).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[field] as boolean}
                      onChange={(e) => setForm({ ...form, [field]: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {form.is_partner && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Partner Tier</label>
                  <input
                    type="text"
                    value={form.partner_tier}
                    onChange={(e) => setForm({ ...form, partner_tier: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. gold, silver"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-slate-100">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
