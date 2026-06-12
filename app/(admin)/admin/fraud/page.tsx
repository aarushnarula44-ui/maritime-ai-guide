'use client'

import { useEffect, useState } from 'react'

interface FraudReport {
  id: string
  college_id: string
  college_name: string
  report_type: string
  description: string | null
  reporter: string
  status: string
  admin_notes: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  investigating: 'bg-blue-100 text-blue-700',
  verified: 'bg-red-100 text-red-700',
  dismissed: 'bg-slate-100 text-slate-500',
}

export default function FraudReportsPage() {
  const [reports, setReports] = useState<FraudReport[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/admin/fraud')
      .then((r) => r.json())
      .then((d) => { setReports(d.reports || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function updateReport(
    report: FraudReport,
    newStatus: string,
    notes: string
  ) {
    setUpdating(report.id)
    const res = await fetch(`/api/admin/fraud/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        admin_notes: notes,
        // If verified, trigger college DGS status update
        update_college_dgs: newStatus === 'verified',
      }),
    })
    setUpdating(null)
    if (res.ok) {
      setToast('Report updated')
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, status: newStatus, admin_notes: notes } : r
        )
      )
    } else {
      setToast('Update failed')
    }
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium">
          {toast}
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-900">Fraud Reports</h2>

      {loading && <p className="text-slate-400">Loading…</p>}

      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            updating={updating === report.id}
            onUpdate={updateReport}
          />
        ))}
        {!loading && reports.length === 0 && (
          <p className="text-slate-400">No fraud reports found.</p>
        )}
      </div>
    </div>
  )
}

function ReportCard({
  report,
  updating,
  onUpdate,
}: {
  report: FraudReport
  updating: boolean
  onUpdate: (r: FraudReport, status: string, notes: string) => void
}) {
  const [status, setStatus] = useState(report.status)
  const [notes, setNotes] = useState(report.admin_notes || '')

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-slate-900">{report.college_name}</p>
          <p className="text-sm text-slate-500 capitalize mt-0.5">{report.report_type.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[report.status] || 'bg-slate-100 text-slate-600'}`}>
            {report.status}
          </span>
          <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {report.description && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{report.description}</p>
      )}

      <p className="text-xs text-slate-400">Reporter: {report.reporter}</p>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {['pending', 'investigating', 'verified', 'dismissed'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Admin Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            placeholder="Add investigation notes…"
          />
        </div>
        {status === 'verified' && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
            ⚠ Saving as Verified will automatically update the college DGS status to &quot;flagged&quot;.
          </p>
        )}
        <button
          onClick={() => onUpdate(report, status, notes)}
          disabled={updating}
          className="px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          {updating ? 'Updating…' : 'Update Report'}
        </button>
      </div>
    </div>
  )
}
