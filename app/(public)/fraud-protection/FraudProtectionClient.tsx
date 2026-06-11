'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, XCircle, Search, ExternalLink, Shield } from 'lucide-react'

interface College {
  id: string
  name: string
  slug: string
  dgs_approval_status: string
  city: string | null
  state: string | null
  type: string
}

interface Props {
  colleges: College[]
}

const WARNING_SIGNS = [
  { icon: '🚨', title: 'Promises 100% job guarantee', desc: 'No legitimate institute can guarantee 100% placement. This is a major red flag.' },
  { icon: '💵', title: 'Asks for cash payment only', desc: 'Always pay fees by bank transfer or demand draft. Never pay cash without a receipt.' },
  { icon: '📄', title: 'Cannot show DGS approval certificate', desc: 'Any DGS-approved MTI must display their approval certificate prominently.' },
  { icon: '🔍', title: 'Not on the official DGS approved MTI list', desc: 'Check dgshipping.gov.in for the official list of Maritime Training Institutes.' },
  { icon: '💰', title: 'Charges unusually high or low fees', desc: 'Fees well below or far above market rates can signal fraud or poor quality.' },
  { icon: '⏰', title: 'Pressures you to decide immediately', desc: 'Legitimate institutes give you time to verify. High pressure = red flag.' },
]

const VERIFY_STEPS = [
  { step: 1, title: 'Check our college database above', desc: 'Search for the college name in our verifier tool.' },
  { step: 2, title: 'Visit dgshipping.gov.in official website', desc: 'The official DGS website lists all approved Maritime Training Institutes.' },
  { step: 3, title: 'Look for DGS approval certificate at the institute', desc: 'Visit the campus and ask to see the original DGS approval certificate.' },
  { step: 4, title: 'Verify approval number with DGS directly', desc: 'Call or email DGS to confirm the approval number is genuine.' },
  { step: 5, title: 'Never pay fees before verification', desc: 'Complete all verification steps before paying any fees whatsoever.' },
]

export function FraudProtectionClient({ colleges }: Props) {
  const [query, setQuery] = useState('')
  const [fraudForm, setFraudForm] = useState({ institute: '', city: '', what: '', contact: '' })
  const [fraudSubmitted, setFraudSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const filtered = query.trim().length >= 2
    ? colleges.filter((c) => c.name.toLowerCase().includes(query.toLowerCase().trim()))
    : []

  async function handleFraudReport(e: React.FormEvent) {
    e.preventDefault()
    if (!fraudForm.institute || !fraudForm.what) return
    setSubmitting(true)
    try {
      await fetch('/api/fraud-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fraudForm),
      })
      setFraudSubmitted(true)
    } catch {
      setFraudSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusDisplay(college: College) {
    if (college.dgs_approval_status === 'approved') {
      return (
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">{college.name}</p>
            <p className="text-sm text-green-700">{college.city}, {college.state}</p>
            <p className="text-sm text-green-700 font-medium mt-1">✓ DGS Approved</p>
            <Link href={`/colleges/${college.slug}`} className="text-xs text-green-600 underline mt-1 inline-block">
              View full details →
            </Link>
          </div>
        </div>
      )
    }
    if (college.dgs_approval_status === 'not_listed' || college.dgs_approval_status === 'flagged' || college.dgs_approval_status === 'suspended') {
      return (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{college.name}</p>
            <p className="text-sm text-red-700">{college.city}, {college.state}</p>
            <p className="text-sm text-red-700 font-medium mt-1">⚠️ {college.dgs_approval_status === 'flagged' ? 'Flagged for review' : college.dgs_approval_status === 'suspended' ? 'Approval suspended' : 'Not on DGS approved list'}</p>
            <p className="text-xs text-red-600 mt-1">Verify directly at dgshipping.gov.in before enrolling.</p>
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800">{college.name}</p>
          <p className="text-sm text-amber-700">Approval status: {college.dgs_approval_status}</p>
          <p className="text-xs text-amber-700 mt-1">Verify directly at dgshipping.gov.in</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-red-900 via-primary to-primary-light text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-red-300" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Protect Yourself from Maritime Fraud
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Every year thousands of students lose money to fraudulent maritime institutes and agents. Here is how to stay safe.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* COLLEGE CHECKER */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">Check if a College is DGS Approved</h2>
          <p className="text-sm text-text-secondary mb-4">Type the college name to instantly check its status in our database.</p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Type college name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {query.trim().length >= 2 && (
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Not found in our database</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Verify directly at{' '}
                      <a href="https://dgshipping.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                        dgshipping.gov.in
                      </a>{' '}
                      before enrolling.
                    </p>
                  </div>
                </div>
              ) : (
                filtered.slice(0, 5).map((college) => (
                  <div key={college.id}>{getStatusDisplay(college)}</div>
                ))
              )}
            </div>
          )}
        </div>

        {/* WARNING SIGNS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-5">How to Spot Fraud</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {WARNING_SIGNS.map((w) => (
              <div key={w.title} className="border border-red-200 rounded-xl p-4 bg-red-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <p className="font-semibold text-red-900 text-sm">{w.title}</p>
                    <p className="text-xs text-red-700 mt-1">{w.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW TO VERIFY */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-5">How to Verify an Institute</h2>
          <div className="space-y-4">
            {VERIFY_STEPS.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
                  <p className="font-semibold text-primary text-sm">{s.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT FRAUD */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">Report a Suspicious Institute</h2>
          <p className="text-sm text-text-secondary mb-5">Help protect other students by reporting suspicious institutes.</p>
          {fraudSubmitted ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Thank you for the report.</p>
                <p className="text-sm text-green-700">We will investigate and update our database accordingly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFraudReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Institute Name *</label>
                <input
                  type="text"
                  required
                  value={fraudForm.institute}
                  onChange={(e) => setFraudForm((p) => ({ ...p, institute: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Name of the suspicious institute"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">City</label>
                <input
                  type="text"
                  value={fraudForm.city}
                  onChange={(e) => setFraudForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="City where institute is located"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">What happened? *</label>
                <textarea
                  required
                  value={fraudForm.what}
                  onChange={(e) => setFraudForm((p) => ({ ...p, what: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  rows={4}
                  placeholder="Describe what happened or what made you suspicious..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Your Contact (optional)</label>
                <input
                  type="text"
                  value={fraudForm.contact}
                  onChange={(e) => setFraudForm((p) => ({ ...p, contact: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Email or phone (optional, for follow-up)"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          )}
        </div>

        {/* OFFICIAL RESOURCES */}
        <div className="bg-primary rounded-2xl p-6 text-white">
          <h2 className="font-display text-xl font-bold mb-2">Official Resources</h2>
          <p className="text-blue-200 text-sm mb-4">Always verify using official government sources.</p>
          <div className="space-y-3">
            <a
              href="https://dgshipping.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <div>
                <p className="font-semibold text-sm">DGS Official Website</p>
                <p className="text-blue-300 text-xs">dgshipping.gov.in</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300" />
            </a>
            <a
              href="https://imu.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <div>
                <p className="font-semibold text-sm">IMU Official Website</p>
                <p className="text-blue-300 text-xs">imu.edu.in</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300" />
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link href="/colleges" className="text-sm text-accent hover:underline font-medium">
            Browse verified colleges →
          </Link>
        </div>
      </div>
    </main>
  )
}
