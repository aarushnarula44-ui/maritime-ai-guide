'use client'

import { useState } from 'react'
import Link from 'next/link'

type Department = 'deck' | 'engine' | 'eto'
type Priority = 'fastest' | 'highest_salary' | 'lowest_cost' | 'work_life_balance'

interface Preferences {
  target_department: string | null
  priority: string | null
}

interface RoadmapNode {
  title: string
  subtitle: string
  salary?: string
  duration?: string
  cost?: string
  what?: string
  challenge?: string
  highlight?: boolean
}

const DECK_NODES: RoadmapNode[] = [
  { title: 'Pre-Sea Training', subtitle: 'B.Sc. Nautical Science (3 yrs) or DNS (1 yr)', cost: '₹3L – ₹8L', duration: '12–36 months', what: 'Classroom and simulator training covering navigation, ship operations, and maritime law.' },
  { title: 'Deck Cadet', subtitle: 'Sea training onboard a vessel', salary: '$400–800/month', duration: '6–12 months', what: 'Hands-on training onboard under a senior officer. You log sea-time and complete a Training Record Book.' },
  { title: '3rd Officer', subtitle: 'CoC Class II required', salary: '$1,500–2,500/month', duration: '2–4 years in', what: 'Bridge watchkeeping, cargo operations, firefighting officer responsibilities.' },
  { title: '2nd Officer', subtitle: 'CoC upgrade required', salary: '$2,500–4,000/month', duration: '4–7 years in', what: 'Medical officer, navigation officer, cargo plan responsibility.' },
  { title: 'Chief Officer', subtitle: 'Senior management rank', salary: '$4,500–7,000/month', duration: '7–12 years in', what: 'Cargo master, responsible for crew safety and vessel stability.' },
  { title: 'Master / Captain ⭐', subtitle: 'Highest deck rank', salary: '$8,000–15,000/month', duration: '12–18 years in', what: 'Complete command of vessel, crew, and cargo. International waters authority.', highlight: true },
]

const ENGINE_NODES: RoadmapNode[] = [
  { title: 'Pre-Sea Training', subtitle: 'GME (1 yr) or B.E. Marine Engineering (4 yrs)', cost: '₹3L – ₹12L', duration: '12–48 months', what: 'Engine theory, thermodynamics, electrical systems, workshop training.' },
  { title: '4th Engineer', subtitle: 'Entry-level engine officer', salary: '$800–1,500/month', duration: '0–2 years in', what: 'Watches in the engine room, maintenance of auxiliary machinery.' },
  { title: '3rd Engineer', subtitle: 'CoC Class III required', salary: '$1,500–2,500/month', duration: '2–4 years in', what: 'Responsibility for boilers, refrigeration, and deck machinery.' },
  { title: '2nd Engineer', subtitle: 'CoC Class II required', salary: '$3,000–5,000/month', duration: '4–8 years in', what: 'Day-work engineer, responsible for maintenance schedules and crew management.' },
  { title: 'Chief Engineer ⭐', subtitle: 'Highest engine rank', salary: '$7,000–14,000/month', duration: '8–15 years in', what: 'Full responsibility for engine plant, fuel efficiency, and engineering crew.', highlight: true },
]

const ETO_NODES: RoadmapNode[] = [
  { title: 'ETO Course', subtitle: 'Electro-Technical Officer course (6–12 months)', cost: '₹2L – ₹5L', duration: '6–12 months', what: 'Electrical systems, automation, GMDSS equipment, PLC programming.' },
  { title: 'ETO (Junior)', subtitle: 'Entry-level position', salary: '$1,500–2,500/month', duration: '0–3 years in', what: 'Maintenance of electrical and electronic equipment onboard.' },
  { title: 'Senior ETO ⭐', subtitle: 'Senior management level', salary: '$3,500–6,000/month', duration: '3–8 years in', what: 'Lead ETO, responsible for all electrical systems and junior ratings.', highlight: true },
]

const RATINGS_NODES: RoadmapNode[] = [
  { title: 'GP Rating Course', subtitle: 'General Purpose Rating (6 months)', cost: '₹50K – ₹1.5L', duration: '6 months', what: 'Basic safety, cargo handling, engine room operations. IMU-CET not required.' },
  { title: 'Able Seaman / Oiler', subtitle: 'Deck or Engine ratings', salary: '$600–1,200/month', duration: '0–3 years in', what: 'Routine maintenance, cargo operations, engine room watches.' },
  { title: 'Senior Rating ⭐', subtitle: 'Bosun / Pumpman', salary: '$1,200–2,000/month', duration: '3–8 years in', what: 'Leading a gang of ratings, specialized cargo or engine room duties.', highlight: true },
]

const DEPT_NODES: Record<string, RoadmapNode[]> = {
  deck: DECK_NODES,
  engine: ENGINE_NODES,
  eto: ETO_NODES,
  ratings: RATINGS_NODES,
}

const DEPT_SUMMARY: Record<string, { timeToJob: string; investment: string; firstSalary: string; topSalaryTime: string }> = {
  deck: { timeToJob: '12–36 months', investment: '₹3L – ₹8L', firstSalary: '$400–800/mo', topSalaryTime: '~15 years' },
  engine: { timeToJob: '12–48 months', investment: '₹3L – ₹12L', firstSalary: '$800–1,500/mo', topSalaryTime: '~12 years' },
  eto: { timeToJob: '6–12 months', investment: '₹2L – ₹5L', firstSalary: '$1,500–2,500/mo', topSalaryTime: '~6 years' },
  ratings: { timeToJob: '6 months', investment: '₹50K – ₹1.5L', firstSalary: '$600–1,200/mo', topSalaryTime: '~8 years' },
}

const STCW_ALL = [
  { label: 'Basic Safety Training (BST)', who: 'all', when: 'Pre-sea (mandatory before joining)', rank: 'Before any ship', duration: '5–7 days', cost: '₹8,000–15,000' },
  { label: 'Proficiency in Survival Craft (PSCRB)', who: 'all', when: 'Before 3rd Officer / 4th Engineer', rank: '3rd Officer / 4th Eng', duration: '3 days', cost: '₹10,000–20,000' },
  { label: 'Advanced Firefighting (AFF)', who: 'all', when: 'Before 3rd Officer / 4th Engineer', rank: '3rd Officer / 4th Eng', duration: '3 days', cost: '₹10,000–18,000' },
  { label: 'Medical First Aid (MFA)', who: 'all', when: 'Before OOW / Officer of Watch', rank: '3rd Officer', duration: '3 days', cost: '₹8,000–15,000' },
  { label: 'GMDSS GOC (Global Maritime Distress)', who: 'deck', when: 'Deck only — before 3rd Officer', rank: '3rd Officer', duration: '45 days', cost: '₹30,000–50,000' },
  { label: 'Bridge Resource Management (BRM)', who: 'deck', when: 'Before Chief Officer', rank: 'Chief Officer', duration: '5 days', cost: '₹15,000–25,000' },
  { label: 'Medical Care (Deck)', who: 'deck', when: 'Before Chief Officer', rank: 'Chief Officer', duration: '5 days', cost: '₹10,000–20,000' },
  { label: 'Engine Room Resource Management (ERM)', who: 'engine', when: 'Before 2nd Engineer', rank: '2nd Engineer', duration: '5 days', cost: '₹15,000–25,000' },
  { label: 'Leadership and Managerial Skills', who: 'all', when: 'Before Master / Chief Engineer', rank: 'Master / Chief Eng', duration: '5 days', cost: '₹20,000–35,000' },
]

const SHORE_CAREERS_DECK = [
  { role: 'Marine Superintendent', experience: '10+ years sea', salary: '₹15–40L/year' },
  { role: 'DGS Surveyor', experience: '8+ years, pass exam', salary: '₹12–25L/year' },
  { role: 'Port State Control Officer', experience: '5+ years OOW', salary: '₹10–20L/year' },
  { role: 'Maritime Lecturer / Instructor', experience: '5+ years sea', salary: '₹8–20L/year' },
  { role: 'Ship Broker', experience: '3+ years sea preferred', salary: '₹15–60L/year' },
  { role: 'Marine Insurance Surveyor', experience: '8+ years sea', salary: '₹12–35L/year' },
]

const SHORE_CAREERS_ENGINE = [
  { role: 'Technical Superintendent', experience: '10+ years sea', salary: '₹15–40L/year' },
  { role: 'Classification Society Surveyor', experience: '8+ years, pass exam', salary: '₹12–30L/year' },
  { role: 'Marine Consultant', experience: '10+ years sea', salary: '₹20–60L/year' },
  { role: 'Offshore Engineering Manager', experience: '8+ years sea', salary: '₹20–50L/year' },
  { role: 'Ship Repair Manager', experience: '8+ years sea', salary: '₹12–30L/year' },
]

const COMPARE_ROWS = [
  { label: 'Pre-sea duration', deck: '12–36 months', engine: '12–48 months', better: 'deck' },
  { label: 'Pre-sea cost', deck: '₹3L – ₹8L', engine: '₹3L – ₹12L', better: 'deck' },
  { label: 'Time to first salary', deck: '~18–36 months', engine: '~12–18 months (GME)', better: 'engine' },
  { label: 'Starting salary', deck: '$400–800/mo', engine: '$800–1,500/mo', better: 'engine' },
  { label: 'Peak salary', deck: '$10,000–15,000/mo', engine: '$10,000–14,000/mo', better: 'similar' },
  { label: 'Time to peak salary', deck: '~15 years', engine: '~12 years', better: 'engine' },
  { label: 'Work environment', deck: 'Bridge — outdoors, navigation', engine: 'Engine room — technical, indoors', better: 'similar' },
]

function NodeCard({ node, index }: { node: RoadmapNode; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`relative border rounded-xl p-4 transition ${node.highlight ? 'border-accent bg-accent/5' : 'border-border bg-white'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${node.highlight ? 'bg-accent text-primary' : 'bg-primary text-white'}`}>
              {index + 1}
            </div>
            <h3 className={`font-semibold text-sm ${node.highlight ? 'text-accent' : 'text-text-primary'}`}>{node.title}</h3>
          </div>
          <p className="text-xs text-text-muted ml-9">{node.subtitle}</p>
          <div className="flex flex-wrap gap-2 mt-2 ml-9">
            {node.salary && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{node.salary}</span>}
            {node.duration && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{node.duration}</span>}
            {node.cost && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{node.cost}</span>}
          </div>
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="text-text-muted text-lg flex-shrink-0 ml-2">{expanded ? '▲' : '▼'}</button>
      </div>
      {expanded && node.what && (
        <div className="mt-3 ml-9 text-xs text-text-secondary border-t border-border/50 pt-3 space-y-2">
          <p>{node.what}</p>
          {node.challenge && <p className="text-amber-700">⚠️ {node.challenge}</p>}
          <Link href="/advisor" className="text-accent hover:underline block">Ask NavAI about this stage →</Link>
        </div>
      )}
    </div>
  )
}

export function RoadmapClient({ preferences, userId }: { preferences: Preferences | null; userId: string | null }) {
  const [dept, setDept] = useState<Department | null>((preferences?.target_department as Department) || null)
  const [prio, setPrio] = useState<Priority | null>((preferences?.priority as Priority) || null)
  const [saving, setSaving] = useState(false)

  const DEPTS = [
    { value: 'deck' as Department, label: 'Deck', icon: '⚓' },
    { value: 'engine' as Department, label: 'Engine', icon: '⚙️' },
    { value: 'eto' as Department, label: 'ETO / Ratings', icon: '⚡' },
  ]

  const PRIOS = [
    { value: 'fastest' as Priority, label: 'Fastest to sea', icon: '🚀' },
    { value: 'highest_salary' as Priority, label: 'Highest salary', icon: '💰' },
    { value: 'lowest_cost' as Priority, label: 'Lowest cost', icon: '💸' },
    { value: 'work_life_balance' as Priority, label: 'Work-life balance', icon: '⚖️' },
  ]

  async function savePrefs() {
    if (!userId) return
    setSaving(true)
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_department: dept, priority: prio }),
    }).catch(() => {})
    setSaving(false)
  }

  const nodes = dept ? (DEPT_NODES[dept] ?? []) : []
  const summary = dept ? DEPT_SUMMARY[dept] : null
  const stcwForDept = dept
    ? STCW_ALL.filter((c) => c.who === 'all' || c.who === dept)
    : STCW_ALL
  const shoreCareers = dept === 'engine' ? SHORE_CAREERS_ENGINE : SHORE_CAREERS_DECK

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Your Personalized Career Roadmap</h1>
          {dept && <p className="text-text-secondary text-sm mt-1">{dept.charAt(0).toUpperCase() + dept.slice(1)} Department{prio ? ` · ${prio.replace('_', ' ')} priority` : ''}</p>}
        </div>
        {dept && <button onClick={() => setDept(null)} className="text-sm text-accent hover:underline">Edit Preferences</button>}
      </div>

      {!dept ? (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-text-primary mb-4">Set your preferences to see a personalized roadmap</h2>
          <div className="mb-6">
            <p className="text-sm font-medium text-text-secondary mb-3">Target Department</p>
            <div className="grid grid-cols-3 gap-3">
              {DEPTS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDept(d.value)}
                  className={`border rounded-xl p-4 text-center transition ${dept === d.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                >
                  <span className="text-2xl block mb-1">{d.icon}</span>
                  <p className="text-sm font-medium text-text-primary">{d.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm font-medium text-text-secondary mb-3">Your Priority</p>
            <div className="grid grid-cols-2 gap-3">
              {PRIOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPrio(p.value)}
                  className={`border rounded-xl p-3 text-left transition ${prio === p.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                >
                  <span className="text-xl mr-2">{p.icon}</span>
                  <span className="text-sm font-medium text-text-primary">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          {userId && <button onClick={savePrefs} disabled={saving || !dept} className="bg-accent text-primary font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-accent-dark transition disabled:opacity-50">{saving ? 'Saving...' : 'Save & View Roadmap'}</button>}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timeline */}
          <div className="space-y-3">
            {nodes.map((node, i) => <NodeCard key={i} node={node} index={i} />)}
          </div>

          {/* Summary */}
          {summary && (
            <div className="bg-primary text-white rounded-xl p-6">
              <h3 className="font-semibold mb-4">Roadmap Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Time to first job', value: summary.timeToJob },
                  { label: 'Total investment', value: summary.investment },
                  { label: 'First salary', value: summary.firstSalary },
                  { label: 'Time to top salary', value: summary.topSalaryTime },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-lg font-bold text-accent">{s.value}</p>
                    <p className="text-blue-300 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STCW Timeline */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="font-semibold text-text-primary mb-5">STCW Certificates Timeline</h3>
            <div className="space-y-3">
              {stcwForDept.map((cert) => (
                <div key={cert.label} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div className="flex-1 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{cert.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">When: {cert.when}</p>
                        <p className="text-xs text-text-muted">Duration: {cert.duration}</p>
                      </div>
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">{cert.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CAREER COMPARISON — always visible */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-xl font-bold text-primary mb-2">Compare Two Career Paths</h2>
        <p className="text-sm text-text-secondary mb-5">Deck Department vs Engine Department — side by side.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs uppercase tracking-wider w-1/3">Factor</th>
                <th className="text-center py-2 px-4 font-semibold text-primary">⚓ Deck</th>
                <th className="text-center py-2 px-4 font-semibold text-primary">⚙️ Engine</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 text-xs text-text-muted">{row.label}</td>
                  <td className={`py-3 px-4 text-center text-sm ${row.better === 'deck' ? 'font-semibold text-green-700' : 'text-text-primary'}`}>
                    {row.deck}
                    {row.better === 'deck' && <span className="ml-1 text-green-600">✓</span>}
                  </td>
                  <td className={`py-3 px-4 text-center text-sm ${row.better === 'engine' ? 'font-semibold text-green-700' : 'text-text-primary'}`}>
                    {row.engine}
                    {row.better === 'engine' && <span className="ml-1 text-green-600">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <Link href="/advisor" className="text-sm text-accent font-semibold hover:underline">
            Which suits me? Ask NavAI →
          </Link>
        </div>
      </div>

      {/* SHORE CAREERS */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-xl font-bold text-primary mb-2">After Your Sea Career</h2>
        <p className="text-sm text-text-secondary mb-5">
          Shore-based roles available to experienced {dept === 'engine' ? 'Engine' : 'Deck'} Officers.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {shoreCareers.map((career) => (
            <div key={career.role} className="border border-border rounded-xl p-4 hover:border-accent/50 transition">
              <p className="font-semibold text-primary text-sm mb-1">{career.role}</p>
              <p className="text-xs text-text-muted">Sea experience: {career.experience}</p>
              <p className="text-xs text-green-700 font-medium mt-1">{career.salary}</p>
              <Link href={`/advisor?q=Tell me about shore career as ${encodeURIComponent(career.role)}`} className="text-xs text-accent hover:underline mt-2 block">
                Ask NavAI about this role →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* PDF EXPORT PLACEHOLDER */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-primary text-sm">Save Your Roadmap</p>
          <p className="text-xs text-text-secondary mt-0.5">PDF export coming soon — for now, take a screenshot or bookmark this page.</p>
        </div>
        <div className="bg-white border border-border rounded-lg px-4 py-2 text-xs text-text-muted">
          Coming soon
        </div>
      </div>
    </div>
  )
}
