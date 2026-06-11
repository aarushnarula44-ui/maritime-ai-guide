'use client'

import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area,
  BarChart, Bar, Cell, CartesianGrid,
} from 'recharts'
import { AlertTriangle, Info } from 'lucide-react'

const INR_RATE = 83

const DEPT_FILTER = ['All', 'Deck', 'Engine', 'ETO', 'Ratings']

interface RankCard {
  rank: string
  dept: 'Deck' | 'Engine' | 'ETO' | 'Ratings'
  minUSD: number
  maxUSD: number
  years: string
}

const RANK_CARDS: RankCard[] = [
  { rank: 'Master / Captain', dept: 'Deck', minUSD: 8000, maxUSD: 15000, years: '15–20' },
  { rank: 'Chief Officer', dept: 'Deck', minUSD: 5000, maxUSD: 9000, years: '8–12' },
  { rank: 'Second Officer', dept: 'Deck', minUSD: 3000, maxUSD: 5500, years: '5–8' },
  { rank: 'Third Officer', dept: 'Deck', minUSD: 1800, maxUSD: 3500, years: '2–5' },
  { rank: 'Deck Cadet', dept: 'Deck', minUSD: 400, maxUSD: 800, years: '0–2' },
  { rank: 'Chief Engineer', dept: 'Engine', minUSD: 10000, maxUSD: 20000, years: '15–20' },
  { rank: 'Second Engineer', dept: 'Engine', minUSD: 6000, maxUSD: 10000, years: '10–15' },
  { rank: 'Third Engineer', dept: 'Engine', minUSD: 3500, maxUSD: 6000, years: '5–10' },
  { rank: 'Fourth Engineer', dept: 'Engine', minUSD: 2000, maxUSD: 4000, years: '2–5' },
  { rank: 'Engine Cadet', dept: 'Engine', minUSD: 400, maxUSD: 800, years: '0–2' },
  { rank: 'ETO (Senior)', dept: 'ETO', minUSD: 5000, maxUSD: 7000, years: '5–10' },
  { rank: 'ETO (Junior)', dept: 'ETO', minUSD: 2500, maxUSD: 5000, years: '0–5' },
  { rank: 'AB Seaman', dept: 'Ratings', minUSD: 1200, maxUSD: 2000, years: '2–5' },
  { rank: 'Ordinary Seaman', dept: 'Ratings', minUSD: 600, maxUSD: 1200, years: '0–2' },
]

const CAREER_ARC = [
  { year: 0, Deck: 600, Engine: 600 },
  { year: 2, Deck: 2000, Engine: 2000 },
  { year: 3, Deck: 2800, Engine: 3000 },
  { year: 5, Deck: 3000, Engine: 5000 },
  { year: 6, Deck: 4500, Engine: 5500 },
  { year: 8, Deck: 5500, Engine: 6000 },
  { year: 10, Deck: 7000, Engine: 7000 },
  { year: 12, Deck: 9000, Engine: 9000 },
  { year: 15, Deck: 11000, Engine: 12000 },
  { year: 18, Deck: 12000, Engine: 13000 },
  { year: 20, Deck: 12000, Engine: 15000 },
]

const ETO_ARC = [
  { year: 0, ETO: 3000 },
  { year: 5, ETO: 5000 },
  { year: 10, ETO: 6000 },
]

const VESSEL_DATA = [
  { vessel: 'Bulk', ChiefOfficer: 5000, ChiefEngineer: 8000 },
  { vessel: 'Container', ChiefOfficer: 5500, ChiefEngineer: 9000 },
  { vessel: 'Offshore', ChiefOfficer: 6500, ChiefEngineer: 11000 },
  { vessel: 'Tanker', ChiefOfficer: 6000, ChiefEngineer: 10000 },
  { vessel: 'LNG', ChiefOfficer: 7000, ChiefEngineer: 14000 },
]

const CAREER_COMPARE = [
  { career: 'Chief Engineer (Maritime)', crore: 12.5, maritime: true },
  { career: 'Ship Captain (Maritime)', crore: 10.8, maritime: true },
  { career: 'IIT Engineer (Software)', crore: 9.6, maritime: false },
  { career: 'MBA (IIM)', crore: 8.4, maritime: false },
  { career: 'Doctor (MBBS)', crore: 5.2, maritime: false },
  { career: 'IAS Officer', crore: 4.8, maritime: false },
]

function fmtINR(usd: number) {
  const inr = usd * INR_RATE
  if (inr >= 100000) return `₹${(inr / 100000).toFixed(1)}L`
  return `₹${inr.toLocaleString()}`
}

function Disclaimer() {
  return (
    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <p>Salary figures shown are industry estimates based on publicly available data. Actual earnings vary by company, vessel type, experience, and market conditions. These are not guaranteed figures.</p>
    </div>
  )
}

function useCounterAnimation(target: number, visible: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = target / 60
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.round(start))
    }, 16)
    return () => clearInterval(id)
  }, [visible, target])
  return val
}

function AnimatedCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const val = useCounterAnimation(15000, visible)
  return (
    <div ref={ref} className="text-center py-8">
      <p className="text-blue-200 mb-2">A Chief Engineer earns up to</p>
      <div className="text-6xl font-bold text-accent">${val.toLocaleString()}</div>
      <p className="text-blue-300 mt-1">/month</p>
      <p className="text-blue-400 text-xs mt-3">Source: Industry estimates — actual figures vary</p>
    </div>
  )
}

export function SalaryExplorer() {
  const [deptFilter, setDeptFilter] = useState('All')
  const [_vesselFilter, _setVesselFilter] = useState('All')
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD')

  const rate = currency === 'INR' ? INR_RATE : 1
  const sym = currency === 'INR' ? '₹' : '$'

  const filteredRanks = RANK_CARDS.filter(r =>
    (deptFilter === 'All' || r.dept === deptFilter)
  ).sort((a, b) => b.maxUSD - a.maxUSD)

  const arcData = CAREER_ARC.map(d => ({
    year: d.year,
    Deck: Math.round(d.Deck * rate),
    Engine: Math.round(d.Engine * rate),
    ...(ETO_ARC.find(e => e.year === d.year) ? { ETO: Math.round((ETO_ARC.find(e => e.year === d.year)!.ETO) * rate) } : {}),
  }))

  const deptColors: Record<string, string> = { Deck: '#1E3A5F', Engine: '#0F4C35', ETO: '#3D1A6E', Ratings: '#4A2A1A' }

  const vesselData = VESSEL_DATA.map(d => ({
    ...d,
    ChiefOfficer: Math.round(d.ChiefOfficer * rate),
    ChiefEngineer: Math.round(d.ChiefEngineer * rate),
  }))

  // Tax calculator state
  const [salary, setSalary] = useState(5000)
  const [daysInIndia, setDaysInIndia] = useState(150)
  const annualINR = salary * 12 * INR_RATE
  const isNRI = daysInIndia < 182
  const taxIfResident = Math.round(annualINR * 0.3)

  return (
    <div className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444]">
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Real Maritime Salaries. No Guesswork.</h1>
          <p className="text-blue-200 text-lg max-w-2xl mb-8">Explore what you will earn at every stage of your maritime career.</p>
          <AnimatedCounter />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* DISCLAIMER */}
        <Disclaimer />

        {/* FILTER BAR */}
        <div className="bg-white border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-xs text-text-muted mb-2">Department</p>
            <div className="flex gap-1.5 flex-wrap">
              {DEPT_FILTER.map(d => (
                <button key={d} onClick={() => setDeptFilter(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${deptFilter === d ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary'}`}
                >{d}</button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-text-muted">Currency:</span>
            <button
              onClick={() => setCurrency(c => c === 'USD' ? 'INR' : 'USD')}
              className="flex items-center gap-1 border border-border rounded-full px-4 py-1.5 text-sm font-medium text-text-primary hover:bg-surface transition"
            >
              <span className={currency === 'USD' ? 'text-accent font-bold' : 'text-text-muted'}>USD</span>
              <span className="text-text-muted mx-1">|</span>
              <span className={currency === 'INR' ? 'text-accent font-bold' : 'text-text-muted'}>INR</span>
            </button>
            {currency === 'INR' && <span className="text-xs text-text-muted">@₹{INR_RATE}/$</span>}
          </div>
        </div>

        {/* CAREER ARC */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-xl text-text-primary mb-1">Salary Progression Over Your Career</h2>
          <p className="text-text-secondary text-sm mb-6">Monthly earnings by years of experience</p>
          <Disclaimer />
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arcData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'Years', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => [`${sym}${Number(v).toLocaleString()}/mo`]} />
                <Legend />
                <Area type="monotone" dataKey="Deck" stroke="#1E3A5F" fill="#1E3A5F" fillOpacity={0.05} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Deck" stroke="#1E3A5F" strokeWidth={2} dot={false} name="Deck" />
                <Line type="monotone" dataKey="Engine" stroke="#0F4C35" strokeWidth={2} dot={false} name="Engine" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANK SALARY CARDS */}
        <div>
          <h2 className="font-bold text-xl text-text-primary mb-1">Salary by Rank</h2>
          <p className="text-text-secondary text-sm mb-4">Industry estimates — not guaranteed figures</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRanks.map(r => {
              const minVal = r.minUSD * rate
              const maxVal = r.maxUSD * rate
              return (
                <div key={r.rank} className="bg-white border border-border rounded-xl overflow-hidden shadow-card">
                  <div className="h-1.5" style={{ backgroundColor: deptColors[r.dept] ?? '#0A1628' }} />
                  <div className="p-5">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{r.dept}</span>
                    <p className="font-bold text-text-primary text-lg mt-1">{r.rank}</p>
                    <p className="text-accent font-bold text-xl mt-2">
                      {sym}{minVal.toLocaleString()} – {sym}{maxVal.toLocaleString()}<span className="text-sm font-normal text-text-muted">/mo</span>
                    </p>
                    {currency === 'INR' && (
                      <p className="text-text-secondary text-xs mt-0.5">
                        ₹{fmtINR(r.minUSD)} – {fmtINR(r.maxUSD)}/mo
                      </p>
                    )}
                    <p className="text-text-muted text-xs mt-3">~{r.years} years from joining</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* VESSEL TYPE COMPARISON */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-xl text-text-primary mb-1">How Vessel Type Affects Your Salary</h2>
          <p className="text-text-secondary text-sm mb-2">Same rank, very different pay</p>
          <Disclaimer />
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vesselData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="vessel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => [`${sym}${Number(v).toLocaleString()}/mo`]} />
                <Legend />
                <Bar dataKey="ChiefOfficer" name="Chief Officer" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ChiefEngineer" name="Chief Engineer" fill="#0F4C35" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm text-text-primary">
            💡 LNG carriers pay the highest rates — up to 40% more than bulk carriers
          </div>
        </div>

        {/* 10-YEAR EARNINGS COMPARISON */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-xl text-text-primary mb-1">10-Year Earnings Comparison</h2>
          <p className="text-text-secondary text-sm mb-2">How maritime compares to other careers</p>
          <Disclaimer />
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={CAREER_COMPARE} margin={{ top: 5, right: 20, left: 140, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}Cr`} />
                <YAxis type="category" dataKey="career" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v: unknown) => [`₹${Number(v)} Crore over 10 years`]} />
                <Bar dataKey="crore" name="10-Year Earnings" radius={[0, 4, 4, 0]}>
                  {CAREER_COMPARE.map((entry, i) => (
                    <Cell key={i} fill={entry.maritime ? '#00D4FF' : '#CBD5E1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-text-muted mt-3 flex items-start gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            Maritime figures assume NRI tax-exempt status. All figures are estimates for illustrative purposes only.
          </p>
        </div>

        {/* TAX CALCULATOR */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-xl text-text-primary mb-1">Calculate Your Tax Benefit as a Seafarer</h2>
          <p className="text-text-secondary text-sm mb-6">Indian seafarers may qualify for significant tax benefits</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Monthly salary (USD): <span className="text-accent font-bold">${salary.toLocaleString()}</span>
                </label>
                <input
                  type="range" min={500} max={20000} step={500}
                  value={salary} onChange={e => setSalary(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>$500</span><span>$20,000</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Days spent in India this year: <span className="text-accent font-bold">{daysInIndia} days</span>
                </label>
                <input
                  type="range" min={0} max={365} step={1}
                  value={daysInIndia} onChange={e => setDaysInIndia(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>0 days</span><span>365 days</span></div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Annual income</span>
                <span className="font-bold text-text-primary">₹{annualINR.toLocaleString()}</span>
              </div>

              {isNRI ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tax as NRI (foreign income)</span>
                    <span className="font-bold text-success">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tax as resident (est. 30%)</span>
                    <span className="font-bold text-text-primary">₹{taxIfResident.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Potential saving</span>
                      <span className="font-bold text-2xl text-accent">₹{taxIfResident.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                    ✓ You may qualify for NRI tax exemption ({daysInIndia} days in India &lt; 182)
                  </div>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                  ⚠️ You may be considered a tax resident this year ({daysInIndia} days in India ≥ 182). Consult a maritime tax advisor for your situation.
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-text-muted mt-4 flex items-start gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            This is a simplified illustration only. Tax rules are complex and change frequently. Always consult a qualified tax advisor or CA for your specific situation. Maritime AI Guide is not a tax advisor.
          </p>
        </div>
      </div>
    </div>
  )
}
