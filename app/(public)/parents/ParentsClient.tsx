'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react'

const FAQS = [
  {
    q: 'Is Merchant Navy safe?',
    a: 'Modern shipping is heavily regulated by international conventions (SOLAS, STCW, MARPOL). Ships carry lifeboats, survival suits, GPS tracking, fire suppression systems, and satellite communication. Seafarers undergo mandatory safety training (Basic Safety Training — BST) before joining any vessel. While all careers carry some risk, modern merchant ships are highly safe working environments with strict international oversight.',
  },
  {
    q: 'How much will my child earn?',
    a: 'Salary depends on rank and vessel type. Starting as a deck or engine cadet: $400–800/month. As a 3rd Officer or 4th Engineer: $1,500–2,500/month. Chief Officer: $4,500–7,000/month. Captain (Master): $8,000–15,000+/month. Chief Engineer: $7,000–14,000+/month. These are USD figures, largely tax-free for qualifying NRI seafarers. See our Salary Explorer for detailed breakdowns by rank.',
  },
  {
    q: 'How long will they be away from home?',
    a: 'Contracts are typically 3–9 months at sea followed by an equal or longer period of leave at home. Many seafarers spend 5–6 months at sea and 6–7 months at home per year. Unlike most shore jobs, the leave period is completely free — no office work, no calls. The total time at home is often more than a typical 9-to-5 job with weekends only.',
  },
  {
    q: 'How do I verify a college is legitimate?',
    a: 'Only enroll in DGS (Directorate General of Shipping) approved institutes. Use our College Verifier tool to check instantly. Additionally, visit dgshipping.gov.in for the official approved MTI list. Always visit the campus before paying fees, ask to see the DGS approval certificate, and pay fees only by bank transfer — never cash. Never pay fees to an agent; always pay directly to the institute.',
  },
  {
    q: 'What are the career growth opportunities?',
    a: 'Clear promotion path from Cadet to Captain or Chief Engineer over 12–18 years of service. After sea service, many officers move to high-paying shore-based roles as Marine Superintendents, DGS Surveyors, Port State Control Officers, Classification Society Surveyors, or Maritime Educators. Strong global demand for Indian seafarers makes this one of the most internationally mobile careers available to Indian youth.',
  },
  {
    q: 'What is the total cost of education?',
    a: 'Depends on course and institute. Government IMU campuses: ₹2.5–5 lakh per year. Private DGS-approved institutes: ₹3–10 lakh per year. Total course cost (1–4 years depending on course) ranges from ₹1.5 lakh (GP Rating) to ₹25+ lakh (B.E. Marine Engineering at premium institutes). Sponsorship programs from shipping companies are available where companies fund education in exchange for a service bond of 2–3 years.',
  },
]

const COMPANIES = [
  'Maersk', 'Anglo-Eastern', 'Bernhard Schulte',
  'V.Ships', 'Wallem Group', 'Synergy Marine', 'Fleet Management',
  'MOL', 'NYK Line', 'Great Eastern Shipping', 'Scorpio Shipping',
]

const CHECKLIST = [
  'Verify college is DGS approved (check dgshipping.gov.in or our College Finder)',
  'Check college reviews on Maritime AI Guide',
  'Confirm fees are paid by bank transfer only — never cash',
  'Get official receipt for all payments',
  'Verify the specific course is DGS approved',
  'Check if college is IMU affiliated',
  'Ask the college for student placement records',
  'Never pay fees to an agent — always pay directly to the institute',
]

function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-surface transition"
      >
        <span className="font-semibold text-primary text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-white border-t border-border text-sm text-text-secondary leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

export function ParentsClient() {
  return (
    <main className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0B2847] via-primary to-[#1a4a7a] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            A Guide for Parents of Maritime Aspirants
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Everything you need to make an informed decision about your child&apos;s maritime career
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* COMMON CONCERNS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-5">Common Parent Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>

        {/* SALARY STATS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-5">The Numbers Speak for Themselves</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-primary rounded-xl p-5 text-white text-center">
              <p className="text-2xl font-bold text-accent mb-1">$10,000+</p>
              <p className="text-sm text-blue-200">Average Captain salary per month</p>
            </div>
            <div className="bg-primary rounded-xl p-5 text-white text-center">
              <p className="text-2xl font-bold text-accent mb-1">$12,000+</p>
              <p className="text-sm text-blue-200">Average Chief Engineer salary per month</p>
            </div>
            <div className="bg-primary rounded-xl p-5 text-white text-center">
              <p className="text-2xl font-bold text-accent mb-1">₹30L+</p>
              <p className="text-sm text-blue-200">Annual tax saving as NRI seafarer</p>
            </div>
          </div>
          <p className="text-xs text-text-muted text-center mt-3">
            USD salaries. Tax benefit for qualifying NRI seafarers under Section 5 & 9 of the Income Tax Act.
          </p>
          <div className="text-center mt-4">
            <Link href="/salary" className="text-sm text-accent font-semibold hover:underline">
              See full salary data by rank →
            </Link>
          </div>
        </div>

        {/* REPUTABLE COMPANIES */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">Reputable Companies That Hire Indian Seafarers</h2>
          <p className="text-sm text-text-secondary mb-4">These established companies regularly recruit qualified Indian officers and ratings.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {COMPANIES.map((company) => (
              <span key={company} className="bg-blue-50 text-primary text-sm font-medium rounded-full px-4 py-1.5 border border-blue-100">
                {company}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted">
            This is a partial list. Many other reputable companies hire qualified Indian seafarers globally.
          </p>
        </div>

        {/* CHECKLIST */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">Before Your Child Enrolls — Parent Checklist</h2>
          <p className="text-sm text-text-secondary mb-5">Complete every item on this checklist before paying any fees.</p>
          <div className="space-y-3">
            {CHECKLIST.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-primary">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/fraud-protection"
            className="bg-red-50 border border-red-200 rounded-2xl p-5 hover:bg-red-100 transition block"
          >
            <h3 className="font-semibold text-red-900 mb-1">🚨 Fraud Protection Center</h3>
            <p className="text-sm text-red-700">Check if a college is DGS approved. Learn how to spot fake institutes.</p>
          </Link>
          <Link
            href="/sponsorships"
            className="bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition block"
          >
            <h3 className="font-semibold text-green-900 mb-1">💰 Sponsorship Programs</h3>
            <p className="text-sm text-green-700">Companies that fund maritime education in exchange for a service bond.</p>
          </Link>
        </div>

        {/* NAVAI CTA */}
        <div className="bg-primary rounded-2xl p-6 text-white text-center">
          <h2 className="font-display text-xl font-bold mb-2">Have More Questions?</h2>
          <p className="text-blue-200 text-sm mb-5">Our AI advisor NavAI can answer specific questions about your child&apos;s situation 24/7, for free.</p>
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-6 py-3 rounded-xl hover:bg-accent-dark transition"
          >
            <Sparkles className="w-5 h-5" />
            Ask NavAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
