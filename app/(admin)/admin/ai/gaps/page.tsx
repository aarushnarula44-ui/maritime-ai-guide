'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

interface Gap {
  id: string
  question: string
  frequency: number
  is_resolved: boolean
  last_asked_at: string
  created_at: string
}

interface GapsResponse {
  gaps: Gap[]
  total: number
  stats: {
    total: number
    pending: number
    resolved: number
  }
}

interface KbForm {
  title: string
  category: string
  content: string
  confidence_level: string
}

const CATEGORIES = [
  'eligibility', 'course_info', 'college_info', 'dgs_regulations',
  'career_paths', 'salary_info', 'cet_info', 'general',
]

export default function KnowledgeGapsPage() {
  const [data, setData] = useState<GapsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [addingFor, setAddingFor] = useState<Gap | null>(null)
  const [kbForm, setKbForm] = useState<KbForm>({ title: '', category: 'general', content: '', confidence_level: 'medium' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [markingId, setMarkingId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/ai/gaps?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  function openAddToKb(gap: Gap) {
    setAddingFor(gap)
    setKbForm({
      title: gap.question,
      category: 'general',
      content: '',
      confidence_level: 'medium',
    })
    setSaveMsg('')
  }

  async function handleAddToKb() {
    if (!addingFor) return
    setSaving(true)
    setSaveMsg('')
    // Create the KB chunk
    const res = await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kbForm),
    })
    if (res.ok) {
      // Mark gap as resolved
      await fetch(`/api/admin/ai/gaps/${addingFor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved: true }),
      })
      setSaveMsg('✓ Added to Knowledge Base')
      load()
      setTimeout(() => { setAddingFor(null); setSaveMsg('') }, 1500)
    } else {
      setSaveMsg('Failed to save')
    }
    setSaving(false)
  }

  async function markOutOfScope(gap: Gap) {
    setMarkingId(gap.id)
    await fetch(`/api/admin/ai/gaps/${gap.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_resolved: true }),
    })
    setMarkingId(null)
    load()
  }

  return (
    <div className="space-y-5 relative">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Knowledge Gaps</h2>
        <p className="text-sm text-slate-500 mt-1">
          Questions NavAI could not answer from the knowledge base. Add these to improve NavAI.
        </p>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Total Gaps', data.stats.total],
            ['Pending', data.stats.pending],
            ['Resolved', data.stats.resolved],
          ].map(([label, val]) => (
            <div key={label as string} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Question</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Asked</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">First Seen</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && data?.gaps.map((gap) => (
                <tr key={gap.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 max-w-[300px]">
                    <p
                      className="truncate text-slate-800 cursor-default"
                      title={gap.question}
                    >
                      {gap.question}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700">{gap.frequency}×</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      gap.is_resolved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {gap.is_resolved ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(gap.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {!gap.is_resolved && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAddToKb(gap)}
                          className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-md hover:bg-cyan-700"
                        >
                          Add to KB
                        </button>
                        <button
                          onClick={() => markOutOfScope(gap)}
                          disabled={markingId === gap.id}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
                        >
                          Out of scope
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && data?.gaps.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">No gaps found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to KB Modal */}
      {addingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddingFor(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add to Knowledge Base</h3>
              <button onClick={() => setAddingFor(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                <span className="font-medium">Question: </span>{addingFor.question}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={kbForm.title}
                  onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={kbForm.category}
                    onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confidence</label>
                  <select
                    value={kbForm.confidence_level}
                    onChange={(e) => setKbForm({ ...kbForm, confidence_level: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Answer Content</label>
                <textarea
                  value={kbForm.content}
                  onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                  rows={6}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="Write the answer to this question…"
                  style={{ minHeight: '150px' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-slate-100">
              {saveMsg && (
                <p className={`text-sm ${saveMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</p>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setAddingFor(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToKb}
                  disabled={saving || !kbForm.content.trim()}
                  className="px-6 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Add to Knowledge Base'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
