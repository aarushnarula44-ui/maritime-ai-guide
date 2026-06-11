'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

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
}

const DEPT_OPTIONS = ['All', 'Deck', 'Engine', 'ETO']
const STATUS_OPTIONS = ['All', 'Open Now', 'Opening Soon']
const TYPE_OPTIONS = ['All', 'Full Sponsorship', 'Partial Sponsorship', 'Guaranteed Employment']

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  open: { label: '● Open', color: 'bg-green-100 text-green-700' },
  opening_soon: { label: '● Opening Soon', color: 'bg-amber-100 text-amber-700' },
  closed: { label: '● Closed', color: 'bg-gray-100 text-gray-500' },
}

const TYPE_BADGE: Record<string, string> = {
  'Full Sponsorship': 'bg-green-100 text-green-700',
  'Partial Sponsorship': 'bg-amber-100 text-amber-700',
  'Guaranteed Employment': 'bg-blue-100 text-blue-700',
}

function fmtDate(d: string | null) {
  if (!d) return 'Unknown'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CompanyInitial({ name }: { name: string }) {
  const colors = ['bg-primary', 'bg-success', 'bg-accent-dark', 'bg-warning']
  const col = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-12 h-12 rounded-full ${col} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
      {name[0]}
    </div>
  )
}

export function SponsorshipClient({ sponsorships }: { sponsorships: SponsorshipRow[] }) {
  const [dept, setDept] = useState('All')
  const [status, setStatus] = useState('All')
  const [type, setType] = useState('All')

  const filtered = sponsorships.filter(s => {
    if (dept !== 'All' && s.department !== dept) return false
    if (status === 'Open Now' && s.status !== 'open') return false
    if (status === 'Opening Soon' && s.status !== 'opening_soon') return false
    if (type !== 'All' && s.sponsorship_type !== type) return false
    return true
  })

  return (
    <div className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444]">
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Get Your Maritime Education Funded</h1>
          <p className="text-blue-200 text-lg max-w-2xl mb-6">Sponsorship programs from India&apos;s top shipping companies</p>
          <div className="flex gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 max-w-2xl">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">Sponsorship programs open and close frequently. Always verify current status directly with the company before applying.</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* FILTER BAR */}
        <div className="bg-white border border-border rounded-xl p-4 mb-8 flex flex-wrap gap-4">
          {[
            { label: 'Department', opts: DEPT_OPTIONS, val: dept, set: setDept },
            { label: 'Status', opts: STATUS_OPTIONS, val: status, set: setStatus },
            { label: 'Type', opts: TYPE_OPTIONS, val: type, set: setType },
          ].map(({ label, opts, val, set }) => (
            <div key={label}>
              <p className="text-xs text-text-muted mb-2">{label}</p>
              <div className="flex gap-1.5 flex-wrap">
                {opts.map(o => (
                  <button key={o} onClick={() => set(o)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${val === o ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}
                  >{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CARDS */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary mb-2">No sponsorships match your filters.</p>
            <Link href="/eligibility" className="text-accent text-sm hover:underline">Set up an alert for when they open →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {filtered.map(s => {
              const statusBadge = STATUS_BADGE[s.status ?? 'closed'] ?? STATUS_BADGE.closed
              const typeCls = TYPE_BADGE[s.sponsorship_type ?? ''] ?? 'bg-gray-100 text-gray-600'
              return (
                <div key={s.id} className="bg-white border border-border rounded-xl p-5 shadow-card flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <CompanyInitial name={s.company_name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary">{s.company_name}</p>
                      <p className="text-text-secondary text-sm">{s.program_name}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusBadge.color}`}>
                      {statusBadge.label}{s.apply_by ? ` — Apply by ${fmtDate(s.apply_by)}` : ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {s.department && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{s.department}</span>
                    )}
                    {s.sponsorship_type && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeCls}`}>{s.sponsorship_type}</span>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm text-text-secondary flex-wrap">
                    <span>Bond: {s.bond_years != null ? `${s.bond_years} yr${s.bond_years > 1 ? 's' : ''}` : 'None'}</span>
                    <span>Stipend: {s.stipend_usd != null ? `$${s.stipend_usd}/mo` : 'No stipend'}</span>
                    <span>Fees: {s.fees_covered_pct != null ? `${s.fees_covered_pct}%` : '—'}</span>
                  </div>

                  {s.notes && <p className="text-xs text-text-muted">{s.notes}</p>}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-xs text-text-muted">Verified: {fmtDate(s.last_verified)}</p>
                    <span className="text-xs text-text-muted italic">View Details →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* HOW SPONSORSHIP WORKS */}
        <div className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="font-bold text-xl text-text-primary mb-6">How Sponsorship Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Apply & Pass Selection', desc: 'Apply directly to the company and pass their written test and interview.' },
              { step: 2, title: 'Company Pays Fees', desc: 'The shipping company pays your training fees at the maritime institute.' },
              { step: 3, title: 'Join Their Fleet', desc: 'After certification, join the company fleet for the agreed bond period.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">{step}</div>
                <h3 className="font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SPONSORED VS SELF-FUNDED */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-xl text-text-primary mb-6">Sponsored vs Self-Funded</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-bold text-green-800 mb-3">✅ Sponsored</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>Training fees paid by company</li>
                <li>Monthly stipend during training</li>
                <li>Guaranteed job after certification</li>
                <li>Bond period required (2–3 years)</li>
              </ul>
            </div>
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-3">🎓 Self-Funded</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>Pay your own training fees</li>
                <li>No bond — free to choose any company</li>
                <li>More flexibility in job placement</li>
                <li>Higher initial cost, more freedom later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
