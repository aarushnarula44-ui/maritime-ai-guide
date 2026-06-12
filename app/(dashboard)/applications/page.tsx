'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { X, Plus } from 'lucide-react'
export const dynamic = 'force-dynamic'

type AppStatus = 'applied' | 'written_test' | 'medical' | 'interview' | 'offered' | 'rejected'

interface Application {
  id: string
  company_name: string
  program_name: string
  department: string | null
  applied_date: string | null
  status: AppStatus
  notes: string | null
  created_at: string
}

const COLUMNS: { id: AppStatus; label: string; color: string }[] = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { id: 'written_test', label: 'Written Test', color: 'bg-purple-100 text-purple-700' },
  { id: 'medical', label: 'Medical', color: 'bg-amber-100 text-amber-700' },
  { id: 'interview', label: 'Interview', color: 'bg-orange-100 text-orange-700' },
  { id: 'offered', label: 'Offered', color: 'bg-green-100 text-green-700' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
]

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ company_name: '', program_name: '', department: '', applied_date: '', notes: '' })
  const [dragging, setDragging] = useState<string | null>(null)
  const dragOver = useRef<AppStatus | null>(null)

  useEffect(() => {
    fetch('/api/user/applications')
      .then((r) => r.json())
      .then((j) => setApps(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function addApp() {
    if (!form.company_name || !form.program_name) return
    const res = await fetch('/api/user/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'applied' }),
    })
    if (res.ok) {
      const j = await res.json()
      setApps((prev) => [j.data, ...prev])
      setShowAdd(false)
      setForm({ company_name: '', program_name: '', department: '', applied_date: '', notes: '' })
    }
  }

  async function updateStatus(id: string, status: AppStatus) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    await fetch(`/api/user/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  function handleDragStart(id: string) { setDragging(id) }
  function handleDragEnd() {
    if (dragging && dragOver.current) updateStatus(dragging, dragOver.current)
    setDragging(null)
    dragOver.current = null
  }

  const inputClass = 'border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent'

  if (loading) return <div className="text-center py-16 text-text-muted">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">My Applications</h1>
          <p className="text-text-secondary text-sm mt-1">Track your sponsorship and college applications</p>
        </div>
        <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Add Application
        </Button>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-semibold text-text-primary mb-2">You have not tracked any applications yet</p>
          <p className="text-text-muted text-sm mb-6">Add your sponsorship applications to track their progress.</p>
          <Button onClick={() => setShowAdd(true)}>Add First Application</Button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => {
              const colApps = apps.filter((a) => a.status === col.id)
              return (
                <div
                  key={col.id}
                  className="w-56 flex-shrink-0"
                  onDragOver={(e) => { e.preventDefault(); dragOver.current = col.id }}
                  onDrop={handleDragEnd}
                >
                  <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg ${col.color}`}>
                    <span className="text-xs font-semibold">{col.label}</span>
                    <span className="text-xs font-bold">{colApps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={() => handleDragStart(app.id)}
                        className="bg-white border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition"
                      >
                        <p className="font-semibold text-sm text-text-primary">{app.company_name}</p>
                        <p className="text-xs text-text-muted mt-0.5">{app.program_name}</p>
                        {app.department && (
                          <span className="inline-block mt-1.5 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{app.department}</span>
                        )}
                        {app.applied_date && (
                          <p className="text-[11px] text-text-muted mt-1.5">Applied {new Date(app.applied_date).toLocaleDateString('en-IN')}</p>
                        )}
                        <div className="mt-2">
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value as AppStatus)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] border border-border rounded px-1.5 py-0.5 w-full focus:outline-none"
                          >
                            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-text-primary">Add Application</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Company Name *</label>
                <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className={inputClass} placeholder="e.g. Shipping Corporation of India" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Program *</label>
                <input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} className={inputClass} placeholder="e.g. Deck Cadet Sponsorship" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass}>
                    <option value="">— Select —</option>
                    <option value="deck">Deck</option>
                    <option value="engine">Engine</option>
                    <option value="eto">ETO</option>
                    <option value="ratings">Ratings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Applied Date</label>
                  <input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <Button variant="outline" onClick={() => setShowAdd(false)} fullWidth>Cancel</Button>
              <Button onClick={addApp} fullWidth disabled={!form.company_name || !form.program_name}>Add Application</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
