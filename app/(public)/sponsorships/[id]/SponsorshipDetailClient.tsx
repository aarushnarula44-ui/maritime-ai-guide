'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Clock, Building2, ExternalLink } from 'lucide-react'

interface SelectionStage {
  stage: number
  title: string
  description: string
}

interface SponsorshipRow {
  id: string
  company_name: string
  program_name: string
  department: string | null
  sponsorship_type: string | null
  bond_years: number | null
  stipend_usd: number | null
  fees_covered_pct: number | null
  status: string | null
  apply_by: string | null
  last_verified: string | null
  notes: string | null
  eligibility_notes: string | null
  selection_process: unknown | null
  eligible_courses: string[] | null
  company_type: string | null
  headquarters: string | null
  fleet_types: string[] | null
  website_url: string | null
}

interface Application {
  id: string
  status: string
  applied_date: string | null
  notes: string | null
}

interface Props {
  sponsorship: SponsorshipRow
  userId: string | null
  existingApplication: Application | null
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800 border-green-200',
  opening_soon: 'bg-amber-100 text-amber-800 border-amber-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  opening_soon: 'Opening Soon',
  closed: 'Closed',
}

const APP_STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'written_test', label: 'Written Test' },
  { value: 'medical', label: 'Medical Exam' },
  { value: 'interview', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
]

export function SponsorshipDetailClient({ sponsorship, userId, existingApplication }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [appliedDate, setAppliedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<Application | null>(existingApplication)
  const [updateStatus, setUpdateStatus] = useState(existingApplication?.status ?? 'applied')
  const [updateNotes, setUpdateNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const statusKey = sponsorship.status ?? 'closed'
  const stages = Array.isArray(sponsorship.selection_process)
    ? (sponsorship.selection_process as SelectionStage[])
    : []

  async function handleTrack() {
    if (!appliedDate) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/sponsorships/${sponsorship.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appliedDate, notes }),
      })
      const json = await res.json()
      if (json.data) {
        setApplication(json.data)
        setShowModal(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateStatus() {
    if (!application) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/sponsorships/${sponsorship.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus, notes: updateNotes }),
      })
      const json = await res.json()
      if (json.data) setApplication(json.data)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {sponsorship.department && (
              <span className="text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
                {sponsorship.department} Department
              </span>
            )}
            {sponsorship.sponsorship_type && (
              <span className="text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
                {sponsorship.sponsorship_type}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{sponsorship.program_name}</h1>
          <p className="text-blue-200 text-lg mb-4">{sponsorship.company_name}</p>
          <span className={`inline-flex items-center gap-1 text-sm font-semibold border rounded-full px-4 py-1.5 ${STATUS_COLORS[statusKey] ?? STATUS_COLORS.closed}`}>
            {statusKey === 'open' && <CheckCircle className="w-4 h-4" />}
            {statusKey === 'opening_soon' && <Clock className="w-4 h-4" />}
            {statusKey === 'closed' && <AlertTriangle className="w-4 h-4" />}
            {STATUS_LABELS[statusKey] ?? statusKey}
          </span>
        </div>
      </section>

      {/* WARNING BANNER */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Sponsorship program details change frequently.</strong> This information was last verified on{' '}
            <strong>{sponsorship.last_verified ?? 'unknown date'}</strong>.
            Always confirm current status directly with the company before applying or paying any fees.
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* PROGRAM DETAILS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-5">Program Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Bond Period</p>
              <p className="font-semibold text-primary">{sponsorship.bond_years ? `${sponsorship.bond_years} years` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Fees Covered</p>
              <p className="font-semibold text-primary">{sponsorship.fees_covered_pct != null ? `${sponsorship.fees_covered_pct}%` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Monthly Stipend</p>
              <p className="font-semibold text-primary">{sponsorship.stipend_usd ? `$${sponsorship.stipend_usd}/month` : 'No stipend'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Department</p>
              <p className="font-semibold text-primary">{sponsorship.department ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Application Deadline</p>
              <p className="font-semibold text-primary">{sponsorship.apply_by ?? 'Check company website'}</p>
            </div>
          </div>
          {sponsorship.eligible_courses && sponsorship.eligible_courses.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Eligible Courses</p>
              <div className="flex flex-wrap gap-2">
                {sponsorship.eligible_courses.map((course) => (
                  <span key={course} className="bg-blue-50 text-primary text-xs font-medium rounded-full px-3 py-1 border border-blue-100">
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sponsorship.notes && (
            <div className="mt-4 bg-amber-50 rounded-lg px-4 py-3 text-sm text-amber-800 border border-amber-100">
              📌 {sponsorship.notes}
            </div>
          )}
        </div>

        {/* SELECTION PROCESS */}
        {stages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-display text-xl font-bold text-primary mb-5">How to Apply</h2>
            <div className="space-y-4">
              {stages.map((s) => (
                <div key={s.stage} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.stage}
                  </div>
                  <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
                    <p className="font-semibold text-primary">{s.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ELIGIBILITY */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-3">Who Can Apply</h2>
          <p className="text-text-secondary mb-4">{sponsorship.eligibility_notes ?? 'Contact the company directly for eligibility criteria.'}</p>
          <Link href="/eligibility" className="text-sm text-accent font-semibold hover:underline">
            Check if you are eligible →
          </Link>
        </div>

        {/* APPLICATION TRACKING */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-4">Track Your Application</h2>
          {!userId ? (
            <div className="text-center py-6">
              <p className="text-text-secondary mb-4">Sign in to track your application status</p>
              <Link href="/login" className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-light transition">
                Sign in to track your application →
              </Link>
            </div>
          ) : application ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Application tracked</p>
                  <p className="text-sm text-green-700">Current status: <strong>{application.status.replace('_', ' ')}</strong></p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Update Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-2"
                >
                  {APP_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Add notes (optional)"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-3 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-light transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-text-secondary mb-4">Log your application to track progress through each stage.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-accent text-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition"
              >
                Track This Application
              </button>
            </div>
          )}
        </div>

        {/* COMPANY INFO */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            About {sponsorship.company_name}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {sponsorship.company_type && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Company Type</p>
                <p className="font-medium text-primary">{sponsorship.company_type}</p>
              </div>
            )}
            {sponsorship.headquarters && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Headquarters</p>
                <p className="font-medium text-primary">{sponsorship.headquarters}</p>
              </div>
            )}
          </div>
          {sponsorship.fleet_types && sponsorship.fleet_types.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Fleet Types</p>
              <div className="flex flex-wrap gap-2">
                {sponsorship.fleet_types.map((ft) => (
                  <span key={ft} className="bg-surface text-text-secondary text-xs rounded-full px-3 py-1 border border-border">
                    {ft}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sponsorship.website_url && (
            <a
              href={sponsorship.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent font-semibold hover:underline"
            >
              Visit Company Website <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="text-center">
          <Link href="/sponsorships" className="text-sm text-text-secondary hover:text-primary transition">
            ← Back to all sponsorship programs
          </Link>
        </div>
      </div>

      {/* TRACK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-floating w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-display text-lg font-bold text-primary mb-4">Track Your Application</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Application Date</label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about your application..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border text-text-primary text-sm font-medium py-2.5 rounded-lg hover:bg-surface transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrack}
                  disabled={submitting || !appliedDate}
                  className="flex-1 bg-accent text-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-accent-dark transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
