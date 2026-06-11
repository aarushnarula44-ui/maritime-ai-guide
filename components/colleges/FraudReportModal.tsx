'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface FraudReportModalProps {
  collegeId: string
  collegeName: string
  onClose: () => void
}

const REPORT_TYPES = [
  { value: 'fake_dgs', label: 'Fake DGS Approval' },
  { value: 'fee_fraud', label: 'Fee Fraud / Overcharging' },
  { value: 'wrong_info', label: 'Wrong Information on Ads' },
  { value: 'no_placement', label: 'False Placement Claims' },
  { value: 'other', label: 'Other Issue' },
]

export function FraudReportModal({ collegeId, collegeName, onClose }: FraudReportModalProps) {
  const [reportType, setReportType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportType) { setError('Please select a report type.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/colleges/${collegeId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, description }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to submit report.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h2 className="font-display font-semibold text-primary">Report an Issue</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-lg transition">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <p className="text-success font-semibold text-lg">Report Submitted</p>
            <p className="text-text-secondary text-sm mt-2">
              Thank you for helping keep the platform safe. We will review your report within 48 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-primary-light transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Reporting: <strong className="text-primary">{collegeName}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Issue Type *</label>
              <div className="space-y-2">
                {REPORT_TYPES.map((rt) => (
                  <label key={rt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={rt.value}
                      checked={reportType === rt.value}
                      onChange={(e) => setReportType(e.target.value)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text-primary">{rt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide any additional details..."
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-border text-text-secondary py-2.5 rounded-xl text-sm font-medium hover:bg-surface transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-danger text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
