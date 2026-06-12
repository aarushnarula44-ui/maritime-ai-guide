'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Plus } from 'lucide-react'

interface KbChunk {
  id: string
  title: string
  category: string
  confidence_level: string
  source_document: string | null
  last_verified_at: string | null
  has_embedding: boolean
  is_active: boolean
}

interface KbStats {
  total: number
  active: number
  with_embeddings: number
  last_updated: string | null
}

const CATEGORIES = [
  'eligibility', 'course_info', 'college_info', 'dgs_regulations',
  'career_paths', 'salary_info', 'cet_info', 'general',
]
const CONFIDENCE_LEVELS = ['high', 'medium', 'low']

interface ChunkForm {
  title: string
  category: string
  content: string
  source_document: string
  source_section: string
  confidence_level: string
  last_verified_at: string
  expires_at: string
  is_active: boolean
}

const defaultForm = (): ChunkForm => ({
  title: '',
  category: 'general',
  content: '',
  source_document: '',
  source_section: '',
  confidence_level: 'medium',
  last_verified_at: '',
  expires_at: '',
  is_active: true,
})

export default function AdminKnowledgePage() {
  const [chunks, setChunks] = useState<KbChunk[]>([])
  const [stats, setStats] = useState<KbStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [confidenceFilter, setConfidenceFilter] = useState('all')
  const [embeddingFilter, setEmbeddingFilter] = useState('all')
  const [editing, setEditing] = useState<KbChunk | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ChunkForm>(defaultForm())
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<KbChunk | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      category: categoryFilter,
      confidence: confidenceFilter,
      embedding: embeddingFilter,
    })
    fetch(`/api/admin/knowledge?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setChunks(d.chunks || [])
        setStats(d.stats || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [categoryFilter, confidenceFilter, embeddingFilter])

  useEffect(() => { load() }, [load])

  function openEdit(chunk: KbChunk) {
    setEditing(chunk)
    setCreating(false)
    setForm({
      title: chunk.title,
      category: chunk.category,
      content: '',
      source_document: chunk.source_document || '',
      source_section: '',
      confidence_level: chunk.confidence_level,
      last_verified_at: chunk.last_verified_at?.slice(0, 10) || '',
      expires_at: '',
      is_active: chunk.is_active,
    })
    setSaveStatus('')
  }

  function openCreate() {
    setEditing(null)
    setCreating(true)
    setForm(defaultForm())
    setSaveStatus('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveStatus('Saving and re-embedding…')
    const url = editing ? `/api/admin/knowledge/${editing.id}` : '/api/admin/knowledge'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSaveStatus('✓ Saved and embedded')
      load()
      setTimeout(() => {
        setEditing(null)
        setCreating(false)
        setSaveStatus('')
      }, 1500)
    } else {
      setSaveStatus('Failed to save')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(confirmDelete.id)
    await fetch(`/api/admin/knowledge/${confirmDelete.id}`, { method: 'DELETE' })
    setDeleting(null)
    setConfirmDelete(null)
    load()
  }

  const isModalOpen = editing || creating

  return (
    <div className="space-y-5 relative">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Total Chunks', stats.total],
            ['Active Chunks', stats.active],
            ['With Embeddings', stats.with_embeddings],
            ['Last Updated', stats.last_updated ? new Date(stats.last_updated).toLocaleDateString() : '—'],
          ].map(([label, val]) => (
            <div key={label as string} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Knowledge Base</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700"
        >
          <Plus size={14} /> Add New Chunk
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Confidence</option>
          {CONFIDENCE_LEVELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={embeddingFilter}
          onChange={(e) => setEmbeddingFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All</option>
          <option value="yes">Has Embedding</option>
          <option value="no">No Embedding</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Confidence</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Source</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Embedding</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && chunks.map((chunk) => (
                <tr key={chunk.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">{chunk.title}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                      {chunk.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      chunk.confidence_level === 'high' ? 'bg-green-100 text-green-700' :
                      chunk.confidence_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {chunk.confidence_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[120px]">
                    {chunk.source_document || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${chunk.has_embedding ? 'bg-green-500' : 'bg-red-400'}`} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(chunk)} className="text-xs text-cyan-600 hover:underline">Edit</button>
                      <button onClick={() => setConfirmDelete(chunk)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && chunks.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No chunks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setEditing(null); setCreating(false) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit Chunk' : 'New Knowledge Chunk'}
              </h3>
              <button onClick={() => { setEditing(null); setCreating(false) }} className="text-slate-400 hover:text-slate-700">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confidence Level</label>
                  <select
                    value={form.confidence_level}
                    onChange={(e) => setForm({ ...form, confidence_level: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CONFIDENCE_LEVELS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="Write the knowledge content here…"
                  style={{ minHeight: '200px' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['source_document', 'Source Document', 'text'],
                  ['source_section', 'Source Section', 'text'],
                  ['last_verified_at', 'Last Verified', 'date'],
                  ['expires_at', 'Expires At', 'date'],
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
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                Is Active
              </label>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-slate-100">
              {saveStatus && (
                <p className={`text-sm ${saveStatus.includes('✓') ? 'text-green-600' : saveStatus.includes('Failed') ? 'text-red-500' : 'text-slate-500'}`}>
                  {saveStatus}
                </p>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => { setEditing(null); setCreating(false) }}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Delete Chunk?</h3>
            <p className="text-sm text-slate-600">
              Are you sure? This will remove <strong>{confirmDelete.title}</strong> from NavAI&apos;s knowledge.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting === confirmDelete.id}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
