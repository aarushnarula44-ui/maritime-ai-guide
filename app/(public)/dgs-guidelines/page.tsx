import type { Metadata } from 'next'
import { ExternalLink, FileText, Shield, BookOpen, Ship, Users, Award } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DGS Guidelines — Official DG Shipping Circulars | Maritime AI Guide',
  description:
    'Access official Directorate General of Shipping (DGS/DGMA) guidelines, training circulars, and approved maritime training standards for India.',
}

const DGS_FACTS = [
  {
    icon: Shield,
    title: 'Regulatory Authority',
    desc: 'DGMA (formerly DGS) is India\'s apex maritime authority under the Ministry of Ports, Shipping and Waterways. It regulates all maritime training institutes and seafarer certification in India.',
  },
  {
    icon: Award,
    title: 'MTI Approvals',
    desc: 'Every maritime training institute in India must obtain DGS approval to conduct pre-sea and post-sea courses. The approved MTI list is maintained on dgma.gov.in.',
  },
  {
    icon: Ship,
    title: 'STCW Compliance',
    desc: 'India is a signatory to the STCW Convention. DGMA ensures all maritime training meets international standards set by the International Maritime Organization (IMO).',
  },
  {
    icon: Users,
    title: 'Seafarer Certification',
    desc: 'DGMA issues Certificates of Competency (CoC) to Indian seafarers and maintains the Indian Seafarers\' Database (ISD) for all serving merchant navy officers.',
  },
]

const KEY_CIRCULARS = [
  {
    title: 'DGS Training Circular No. 12 of 2020',
    desc: 'Minimum eligibility criteria for pre-sea maritime courses including IMU-CET requirements — Physics, Chemistry, Maths percentages, English requirements, and age limits for DNS, B.Sc. Nautical Science, GME, and more.',
    file: '/dgs-training-circular-12-2020.pdf',
    isLocal: true,
    year: '2020',
    category: 'Pre-Sea Training',
  },
]

export default function DGSGuidelinesPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] text-white py-16 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Official Guidelines</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            DGS Guidelines & Circulars
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mb-6">
            Official resources from the Directorate General of Shipping (DGMA) — India&apos;s maritime regulatory authority.
          </p>
          <a
            href="https://dgma.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-accent-dark transition text-sm"
          >
            Visit dgma.gov.in
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* About DGMA */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">About the Directorate General of Shipping</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            The <strong>Directorate General of Shipping & Maritime Administration (DGMA)</strong>, previously known as DGS (Directorate General of Shipping), is the principal authority for maritime affairs in India under the <strong>Ministry of Ports, Shipping and Waterways</strong>.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            DGMA is responsible for implementing the Merchant Shipping Act, 1958, and ensures that Indian maritime training meets STCW international standards. It maintains the official list of approved Maritime Training Institutes (MTIs) and issues Certificates of Competency (CoC) to Indian seafarers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {DGS_FACTS.map((fact) => (
              <div key={fact.title} className="flex gap-3 p-4 bg-surface rounded-xl border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <fact.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm mb-1">{fact.title}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{fact.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Circulars */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">DGS Training Circulars</h2>
          <p className="text-sm text-text-secondary mb-5">
            Training Circulars are official notifications from DGMA that specify eligibility criteria, course standards, and regulatory updates for maritime education in India.
          </p>
          <div className="space-y-4">
            {KEY_CIRCULARS.map((circ) => (
              <div key={circ.title} className="border border-border rounded-xl p-5 hover:border-primary/30 hover:bg-surface/50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary text-sm mb-1">{circ.title}</p>
                      <p className="text-xs text-text-secondary leading-relaxed mb-2">{circ.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">{circ.category}</span>
                        <span className="text-xs text-text-muted">{circ.year}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={circ.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary-light transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What DGS Circular 12/2020 Covers */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-4">What Circular 12/2020 Covers</h2>
          <div className="space-y-3">
            {[
              { label: 'DNS — Diploma in Nautical Science', req: '10+2 PCM ≥ 60%, English ≥ 50%' },
              { label: 'B.Sc. Nautical Science (4 Year)', req: '10+2 PCM ≥ 60%, English ≥ 50%' },
              { label: 'B.E. / B.Tech Marine Engineering', req: '10+2 PCM ≥ 60%, English ≥ 50%' },
              { label: 'Graduate Marine Engineering (GME)', req: 'B.E./B.Tech Mechanical/Marine with ≥ 50%' },
              { label: 'Diploma Marine Engineering (DMET)', req: '10th pass + 3-year Engg. Diploma, PCM' },
              { label: 'Electro-Technical Officer (ETO)', req: 'B.E./B.Tech Electrical/Electronics ≥ 50%' },
              { label: 'GP Rating', req: '10th pass, English ≥ 40%, Physical fitness' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
                <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.req}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4">
            * Requirements shown are summaries. Always refer to the full PDF circular for exact criteria.
          </p>
        </div>

        {/* Official Links */}
        <div className="bg-primary rounded-2xl p-6 text-white">
          <h2 className="font-display text-xl font-bold mb-2">Official DGMA Resources</h2>
          <p className="text-blue-200 text-sm mb-4">Access official government portals for the most up-to-date information.</p>
          <div className="space-y-3">
            <a
              href="https://dgma.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <div>
                <p className="font-semibold text-sm">DGMA Official Website</p>
                <p className="text-blue-300 text-xs">dgma.gov.in — Approved MTI list, circulars, seafarer services</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300 flex-shrink-0" />
            </a>
            <a
              href="https://imu.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <div>
                <p className="font-semibold text-sm">Indian Maritime University (IMU)</p>
                <p className="text-blue-300 text-xs">imu.edu.in — IMU-CET information and affiliated colleges</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300 flex-shrink-0" />
            </a>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-text-muted">
            Data on this page is based on DGS Training Circular No. 12 of 2020 and official DGMA sources.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/fraud-protection" className="text-sm text-accent hover:underline font-medium">
              Fraud Protection →
            </Link>
            <Link href="/colleges" className="text-sm text-accent hover:underline font-medium">
              Verified Colleges →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
