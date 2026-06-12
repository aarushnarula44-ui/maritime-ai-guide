'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  body: string
  type: string
  audience: string
  is_active: boolean
  published_at: string | null
  expires_at: string | null
  created_at: string
}

interface AnnouncementForm {
  title: string
  body: string
  type: string
  audience: string
  publish_immediately: boolean
  expires_at: string
}

const TYPE_LABELS: Record<string, string> = {
  cet_update: 'CET Update',
  new_circular: 'New Circular',
  sponsorship_open: 'Sponsorship Open',
  platform_update: 'Platform Update',
}

const TYPE_COLORS: Record<string, string> = {
  cet_update: 'bg-blue-100 text-blue-700',
  new_circular: 'bg-purple-100 text-purple-700',
  sponsorship_open: 'bg-green-100 text-green-700',
  platform_update: 'bg-slate-100 text-slate-700',
}

function defaultForm(): AnnouncementForm {
  return {
    title: '',
    body: '',
    type: 'platform_update',
    audience: 'all',
    publish_immediately: false,
    expires_at: '',
  }
}

function getStatus(a: Announcement): { label: string; color: string } {
  if (!a.is_active) return { label: 'Deleted', color: 'bg-slate-100 text-slate-500' }
  if (a.expires_at && new Date(a.expires_at) < new Date())
    return { label: 'Expired', color: 'bg-red-100 text-red-600' }
  if (a.published_at) return { label: 'Published', color: 'bg-green-100 text-green-700' }
  return { label: 'Draft', color: 'bg-amber-100 text-amber-700' }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AnnouncementForm>(defaultForm())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function load() {
    const res = await fetch('/api/admin/announcements')
    const d = await res.json()
    setAnnouncements(d.announcements ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm())
    setModalOpen(true)
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      body: a.body,
      type: a.type,
      audience: a.audience,
      publish_immediately: !!a.published_at,
      expires_at: a.expires_at?.slice(0, 10) ?? '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    if (editingId) {
      await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      })
      showToast('Announcement updated')
    } else {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      showToast(form.publish_immediately ? 'Published! Notifications sent.' : 'Draft saved.')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  async function handlePublish(a: Announcement) {
    await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, is_active: true, published_at: new Date().toISOString() }),
    })
    showToast('Published')
    load()
  }

  async function handleDelete(a: Announcement) {
    await fetch(`/api/admin/announcements?id=${a.id}`, { method: 'DELETE' })
    showToast('Deleted')
    load()
  }

  return (
    <div className="space-y-5 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Announcements</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700"
        >
          <Plus size={14} /> Create New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Audience</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Published</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Expires</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && announcements.map((a) => {
                const status = getStatus(a)
                return (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">{a.title}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] || 'bg-slate-100 text-slate-600'}`}>
                        {TYPE_LABELS[a.type] || a.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{a.audience.replace('_', ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="text-xs text-cyan-600 hover:underline">Edit</button>
                        {!a.published_at && (
                          <button onClick={() => handlePublish(a)} className="text-xs text-green-600 hover:underline">Publish</button>
                        )}
                        <button onClick={() => handleDelete(a)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && announcements.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">No announcements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={5}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium Only</option>
                    <option value="deck_aspirants">Deck Aspirants</option>
                    <option value="engine_aspirants">Engine Aspirants</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Expires At (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publish_immediately}
                  onChange={(e) => setForm({ ...form, publish_immediately: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                Publish immediately (sends notifications to target audience)
              </label>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.body.trim()}
                className="px-6 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : form.publish_immediately ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
