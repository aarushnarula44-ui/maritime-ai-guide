'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Trophy, ChevronRight } from 'lucide-react'

const COURSES = [
  { name: 'B.Sc. Nautical Science', dept: 'Deck', duration: '3 Years', minQual: 'Class 12 PCM', salary: '$400–$15,000/mo', color: '#1E3A5F', slug: 'bsc-nautical-science' },
  { name: 'DNS', dept: 'Deck', duration: '1 Year', minQual: 'Class 12 PCM', salary: '$400–$15,000/mo', color: '#1E3A5F', slug: 'dns-diploma-nautical-science' },
  { name: 'BE Marine Engineering', dept: 'Engine', duration: '4 Years', minQual: 'Class 12 PCM', salary: '$400–$20,000/mo', color: '#0F4C35', slug: 'be-btech-marine-engineering' },
  { name: 'GME', dept: 'Engine', duration: '1 Year', minQual: 'BE Mechanical', salary: '$400–$20,000/mo', color: '#0F4C35', slug: 'graduate-marine-engineering' },
  { name: 'Diploma Marine Engineering', dept: 'Engine', duration: '2 Years', minQual: 'Class 10', salary: '$300–$12,000/mo', color: '#0F4C35', slug: 'diploma-marine-engineering' },
  { name: 'ETO', dept: 'ETO', duration: '4 Months', minQual: 'BE Electrical/Electronics', salary: '$2,500–$7,000/mo', color: '#3D1A6E', slug: 'electro-technical-officer' },
  { name: 'GP Rating', dept: 'Ratings', duration: '6 Months', minQual: 'Class 10', salary: '$600–$2,000/mo', color: '#1A4A2E', slug: 'gp-rating' },
  { name: 'Maritime Catering (CCMC)', dept: 'Catering', duration: '6 Months', minQual: 'Class 10', salary: '$500–$1,500/mo', color: '#4A2A1A', slug: 'maritime-catering-ccmc' },
]

const PROBLEMS = [
  { icon: '🤔', title: "Don't know which maritime course you qualify for", hint: 'Our AI checks your eligibility in 60 seconds' },
  { icon: '📚', title: 'Confused between DNS, B.Sc. Nautical, GME, ETO...', hint: 'We break down all 8 DGS-approved courses simply' },
  { icon: '⚠️', title: 'Worried about fake colleges taking your money', hint: 'We verify every college against official DGS records' },
  { icon: '💰', title: 'No idea what salary to expect at sea', hint: 'Real salary data for every rank and department' },
  { icon: '👨‍👩‍👦', title: 'Parents have questions about merchant navy safety', hint: 'Trusted info backed by government circular data' },
  { icon: '🤖', title: 'Need personal guidance but coaching is expensive', hint: 'NavAI gives 24/7 AI-powered career advice for free' },
]

const QUALIFICATIONS = [
  { label: 'Class 10', value: 'class_10' },
  { label: 'Class 12 PCM', value: 'class_12' },
  { label: 'Diploma', value: 'diploma' },
  { label: 'Graduate', value: 'graduate' },
]

function useIntersection(ref: React.RefObject<Element>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

export default function LandingPage() {
  const [qual, setQual] = useState('')
  const [pcm, setPcm] = useState(70)
  const [age, setAge] = useState(18)
  const [step, setStep] = useState(1)
  const problemsRef = useRef<HTMLDivElement>(null)
  const problemsVisible = useIntersection(problemsRef as React.RefObject<Element>)

  const eligibleCount = qual ? (qual === 'class_10' ? 2 : qual === 'class_12' ? 4 : qual === 'diploma' ? 3 : 5) : 0

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0D2444] flex items-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="flex items-center gap-1 text-xs bg-white/10 text-blue-200 border border-white/20 rounded-full px-3 py-1">
                <Shield className="w-3 h-3" /> Based on Official DGS Circular 2020
              </span>
              <span className="flex items-center gap-1 text-xs bg-white/10 text-blue-200 border border-white/20 rounded-full px-3 py-1">
                <Zap className="w-3 h-3" /> AI-Powered Guidance
              </span>
              <span className="flex items-center gap-1 text-xs bg-white/10 text-blue-200 border border-white/20 rounded-full px-3 py-1">
                <Trophy className="w-3 h-3" /> 8 Maritime Career Paths
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Your Merchant Navy Career{' '}
              <span className="text-accent">Starts Here.</span>
            </h1>

            <p className="text-blue-200 text-lg md:text-xl mb-8 leading-relaxed">
              India&apos;s first AI-powered maritime career platform. Know your eligibility in 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/eligibility"
                className="flex items-center justify-center gap-2 bg-accent text-primary font-bold py-4 px-8 rounded-full hover:bg-accent-dark transition text-base"
              >
                Check My Eligibility Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 border border-white/30 text-white py-4 px-8 rounded-full hover:bg-white/10 transition text-base"
              >
                How It Works ↓
              </a>
            </div>

            <p className="text-blue-300 text-sm">
              47,000+ aspirants guided · Trusted by DGS guidelines
            </p>
          </div>

          {/* Ship illustration */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative animate-wave">
              <svg viewBox="0 0 400 300" className="w-full max-w-md" fill="none">
                {/* Ocean waves */}
                <ellipse cx="200" cy="250" rx="190" ry="30" fill="#00D4FF" opacity="0.15"/>
                <path d="M10 240 Q100 220 200 240 Q300 260 390 240" stroke="#00D4FF" strokeWidth="3" opacity="0.4" fill="none"/>
                <path d="M10 255 Q100 235 200 255 Q300 275 390 255" stroke="#00D4FF" strokeWidth="2" opacity="0.25" fill="none"/>
                {/* Hull */}
                <path d="M70 200 L330 200 L310 230 L90 230 Z" fill="#1E3A5F"/>
                <path d="M90 230 L310 230 L295 245 L105 245 Z" fill="#0A1628"/>
                {/* Superstructure */}
                <rect x="130" y="160" width="140" height="45" rx="4" fill="#1E3A5F"/>
                <rect x="150" y="135" width="100" height="30" rx="3" fill="#243D6B"/>
                <rect x="170" y="115" width="60" height="25" rx="2" fill="#1E3A5F"/>
                {/* Windows */}
                <rect x="140" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.7"/>
                <rect x="162" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.7"/>
                <rect x="184" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.5"/>
                <rect x="206" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.7"/>
                <rect x="228" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.5"/>
                <rect x="250" y="170" width="15" height="12" rx="2" fill="#00D4FF" opacity="0.7"/>
                {/* Funnel */}
                <rect x="195" y="90" width="25" height="30" rx="3" fill="#FF6B6B"/>
                <rect x="193" y="85" width="29" height="8" rx="2" fill="#CC5555"/>
                {/* Mast */}
                <line x1="200" y1="60" x2="200" y2="115" stroke="#94A3B8" strokeWidth="2"/>
                <line x1="200" y1="75" x2="240" y2="90" stroke="#94A3B8" strokeWidth="1"/>
                <line x1="200" y1="75" x2="160" y2="90" stroke="#94A3B8" strokeWidth="1"/>
                {/* Flag */}
                <rect x="200" y="60" width="20" height="14" rx="1" fill="#FF9933"/>
                <rect x="200" y="60" width="20" height="5" rx="1" fill="#FF9933"/>
                <rect x="200" y="69" width="20" height="5" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white py-6 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 md:gap-0 overflow-x-auto md:justify-around">
            {[
              { num: '47,000+', label: 'Students Guided' },
              { num: '8', label: 'Career Paths' },
              { num: '200+', label: 'Colleges Listed' },
              { num: '100%', label: 'DGS Accurate' },
              { num: 'Free', label: 'to Start' },
            ].map((s) => (
              <div key={s.label} className="flex-shrink-0 text-center px-6 md:px-0">
                <p className="font-display text-2xl font-bold text-accent">{s.num}</p>
                <p className="text-text-muted text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM CARDS */}
      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-center mb-3">
            If Any of These Sound Like You,<br />You&apos;re in the Right Place.
          </h2>
          <div ref={problemsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-5 shadow-card transition-all duration-500 ${
                  problemsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <p className="font-semibold text-text-primary mb-1">{p.title}</p>
                <p className="text-text-muted text-sm">{p.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INLINE ELIGIBILITY CHECKER */}
      <section className="bg-primary py-16" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-12 items-center">
          <div className="text-white md:w-1/2">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Find Out Which Courses You Qualify For.{' '}
              <span className="text-accent">Right Now.</span>
            </h2>
            <p className="text-blue-200 text-lg">
              Answer 3 quick questions and see your eligible maritime career paths instantly.
            </p>
          </div>

          <div className="md:w-1/2 w-full bg-white/10 backdrop-blur-sm border border-accent/30 rounded-2xl p-6 shadow-floating">
            {step === 1 && (
              <div>
                <p className="text-white font-semibold mb-4">Step 1: What is your highest qualification?</p>
                <div className="grid grid-cols-2 gap-3">
                  {QUALIFICATIONS.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => { setQual(q.value); setStep(2) }}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition ${
                        qual === q.value
                          ? 'bg-accent text-primary'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-white font-semibold mb-2">Step 2: Your PCM/Aggregate percentage?</p>
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="range" min={40} max={100} value={pcm}
                    onChange={(e) => setPcm(Number(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-accent font-bold text-xl w-16 text-right">{pcm}%</span>
                </div>
                <button onClick={() => setStep(3)} className="w-full bg-accent text-primary font-semibold py-2.5 rounded-lg hover:bg-accent-dark transition">
                  Next →
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-white font-semibold mb-2">Step 3: Your current age?</p>
                <input
                  type="number" min={15} max={40} value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:border-accent mb-4"
                />
                <Link
                  href={`/eligibility?qual=${qual}&pcm=${pcm}&age=${age}`}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-primary font-bold py-3 rounded-lg hover:bg-accent-dark transition"
                >
                  See Your {eligibleCount} Eligible Courses <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            {step < 3 && (
              <div className="flex gap-1 mt-4">
                {[1,2,3].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-white/20'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COURSE QUICK BROWSE */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-center mb-2">
            8 Official Maritime Career Paths
          </h2>
          <p className="text-text-secondary text-center mb-10">All approved by Directorate General of Shipping, India</p>
          <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-4 pb-4 md:pb-0">
            {COURSES.map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="flex-shrink-0 w-56 md:w-auto bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="h-2" style={{ backgroundColor: c.color }} />
                <div className="p-4">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{c.dept}</span>
                  <h3 className="font-display font-semibold text-primary mt-1 mb-2 leading-tight">{c.name}</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-text-secondary">⏱ {c.duration}</p>
                    <p className="text-xs text-text-secondary">📋 {c.minQual}</p>
                  </div>
                  <p className="text-accent font-semibold text-sm">{c.salary}</p>
                  <p className="text-accent text-xs mt-2 font-medium">Explore →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / PARENT SECTION */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-floating">
          <div className="bg-primary p-10 text-white">
            <h2 className="font-display text-2xl font-bold mb-6">For Parents Who Have Questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Is merchant navy a stable career?', a: 'Yes. Certified officers are in global demand. Indian-licensed officers work on ships worldwide.' },
                { q: 'Are the salaries real?', a: 'Yes. Chief Engineers earn ₹15–₹60 lakhs/month tax-free. Even entry-level officers earn ₹1.5–2L/month.' },
                { q: 'How do we find verified colleges?', a: 'Use our College Finder. We cross-verify every institute against the official DGS approval list.' },
              ].map((item) => (
                <div key={item.q}>
                  <p className="font-semibold text-accent mb-1">Q: {item.q}</p>
                  <p className="text-blue-200 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface p-10">
            <h2 className="font-display text-2xl font-bold text-primary mb-6">Why Trust Us?</h2>
            <div className="space-y-4">
              {[
                { num: '100%', label: 'Data from official DGS Training Circular No. 12 of 2020' },
                { num: '0', label: 'Paid placements or college partnerships influencing results' },
                { num: '8', label: 'Officially recognized pre-sea training courses covered' },
                { num: '24/7', label: 'AI guidance available free of charge' },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-3">
                  <span className="font-display text-2xl font-bold text-accent flex-shrink-0">{s.num}</span>
                  <p className="text-text-secondary text-sm pt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-light py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Your Dream Maritime Career Is Closer Than You Think.
          </h2>
          <p className="text-blue-200 mb-8">Join 47,000+ students already using Maritime AI Guide.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent text-primary font-bold py-4 px-10 rounded-full hover:bg-accent-dark transition text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-300 text-sm mt-4">No credit card required</p>
        </div>
      </section>
    </>
  )
}
