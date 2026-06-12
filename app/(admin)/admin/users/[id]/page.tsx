'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface UserDetail {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  date_of_birth: string | null
  category: string | null
  state: string | null
  role: string
  is_premium: boolean
  created_at: string
  updated_at: string
  academic: Record<string, unknown> | null
  stats: {
    eligibility_checks: number
    ai_messages: number
    mock_tests: number
    saved_courses: number
    saved_colleges: number
  }
  recent_events: {
    id: string
    time: string
    event: string
    page: string
  }[]
}

const ASSIGNABLE_ROLES = ['student', 'college_partner', 'company_partner', 'admin']

export default function UserDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newRole, setNewRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setUser(d)
        setNewRole(d.role || 'student')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleRoleChange() {
    setSaving(true)
    setSaveMsg('')
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setSaving(false)
    if (res.ok) {
      setSaveMsg('Role updated successfully')
      setUser((u) => u ? { ...u, role: newRole } : u)
    } else {
      setSaveMsg('Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    )
  }

  if (!user) return <p className="text-slate-500">User not found.</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/users" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to Users
      </Link>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center text-xl font-bold text-cyan-700 flex-shrink-0">
            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{user.full_name || '—'}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                {user.role.replace('_', ' ')}
              </span>
              {user.is_premium && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Premium</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
          {[
            ['Phone', user.phone || '—'],
            ['Date of Birth', user.date_of_birth || '—'],
            ['Category', user.category || '—'],
            ['State', user.state || '—'],
            ['Joined', new Date(user.created_at).toLocaleDateString()],
            ['Last Updated', new Date(user.updated_at).toLocaleDateString()],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm text-slate-800 capitalize">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Profile */}
      {user.academic && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Academic Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(user.academic)
              .filter(([, v]) => v !== null && v !== undefined)
              .map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-400">{k.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-slate-800">{String(v)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Activity Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            ['Eligibility Checks', user.stats.eligibility_checks],
            ['NavAI Messages', user.stats.ai_messages],
            ['Mock Tests', user.stats.mock_tests],
            ['Saved Courses', user.stats.saved_courses],
            ['Saved Colleges', user.stats.saved_colleges],
          ].map(([label, val]) => (
            <div key={label as string} className="text-center">
              <p className="text-2xl font-bold text-slate-900">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {user.recent_events.map((ev) => (
            <div key={ev.id} className="flex gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
              <span className="text-slate-400 whitespace-nowrap">{ev.time}</span>
              <span className="font-medium text-slate-800">{ev.event}</span>
              <span className="text-slate-500 truncate">{ev.page}</span>
            </div>
          ))}
          {user.recent_events.length === 0 && (
            <p className="text-slate-400 text-sm">No recent activity recorded.</p>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Admin Actions</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Change Role:</label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleRoleChange}
            disabled={saving || newRole === user.role}
            className="px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Role Change'}
          </button>
          {saveMsg && (
            <p className={`text-sm ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
