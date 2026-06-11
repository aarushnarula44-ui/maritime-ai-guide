import type { Metadata } from 'next'
import Link from 'next/link'
import { STATIC_COLLEGES, STATIC_COLLEGE_COURSES, STATIC_COURSES } from '@/lib/static-data'
import { Shield, Check, X as XIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compare Maritime Colleges | Maritime AI Guide',
}

interface PageProps {
  searchParams: { ids?: string }
}

export default function CollegeComparePage({ searchParams }: PageProps) {
  const ids = searchParams.ids?.split(',').filter(Boolean) ?? []
  const colleges = ids
    .map((id) => STATIC_COLLEGES.find((c) => c.id === id || c.slug === id))
    .filter(Boolean) as typeof STATIC_COLLEGES

  if (colleges.length < 2) {
    return (
      <main className="min-h-screen pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary mb-4">Compare Colleges</h1>
          <p className="text-text-secondary mb-6">
            Select at least 2 colleges to compare. Use the <strong>Compare +</strong> button on college cards.
          </p>
          <Link href="/colleges" className="inline-flex items-center gap-2 bg-accent text-primary font-bold py-3 px-6 rounded-full hover:bg-accent-dark transition">
            Browse Colleges →
          </Link>
        </div>
      </main>
    )
  }

  const STATUS_COLORS: Record<string, string> = {
    approved: 'text-success',
    pending: 'text-warning',
    not_listed: 'text-danger',
    flagged: 'text-danger',
  }

  function getCoursesForCollege(collegeSlug: string) {
    return STATIC_COLLEGE_COURSES
      .filter((cc) => cc.college_slug === collegeSlug)
      .map((cc) => STATIC_COURSES.find((c) => c.slug === cc.course_slug)?.short_name ?? cc.course_slug)
  }

  function avgFees(collegeSlug: string) {
    const fees = STATIC_COLLEGE_COURSES.filter((cc) => cc.college_slug === collegeSlug).map((cc) => cc.annual_fees)
    if (!fees.length) return 'N/A'
    const avg = fees.reduce((a, b) => a + b, 0) / fees.length
    return `₹${avg.toLocaleString('en-IN')}/yr avg`
  }

  const rows: { label: string; getValue: (c: typeof colleges[0]) => string | React.ReactNode }[] = [
    { label: 'DGS Status', getValue: (c) => (
      <span className={`font-semibold ${STATUS_COLORS[c.dgs_approval_status] ?? 'text-text-primary'}`}>
        {c.dgs_approval_status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    )},
    { label: 'Type', getValue: (c) => c.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) },
    { label: 'Location', getValue: (c) => [c.city, c.state].filter(Boolean).join(', ') || 'N/A' },
    { label: 'DGS Approval No.', getValue: (c) => c.dgs_approval_number ?? 'N/A' },
    { label: 'Courses Offered', getValue: (c) => (
      <div className="flex flex-wrap gap-1">
        {getCoursesForCollege(c.slug).map((name) => (
          <span key={name} className="text-xs bg-surface text-text-secondary border border-border rounded-full px-2 py-0.5">{name}</span>
        ))}
      </div>
    )},
    { label: 'Avg Annual Fees', getValue: (c) => avgFees(c.slug) },
    { label: 'IMU Affiliated', getValue: (c) => c.imu_affiliated
      ? <Check className="w-5 h-5 text-success" />
      : <XIcon className="w-5 h-5 text-danger" />
    },
    { label: 'Hostel', getValue: (c) => c.hostel_available
      ? <Check className="w-5 h-5 text-success" />
      : <XIcon className="w-5 h-5 text-danger" />
    },
    { label: 'Rating', getValue: (c) => c.rating_avg != null ? `${c.rating_avg.toFixed(1)} / 5 (${c.rating_count})` : 'No ratings yet' },
    { label: 'Total Seats', getValue: (c) => c.total_seats ? String(c.total_seats) : 'N/A' },
    { label: 'Established', getValue: (c) => c.established_year ? String(c.established_year) : 'N/A' },
    { label: 'Last DGS Verified', getValue: (c) => c.last_dgs_verified ?? 'N/A' },
  ]

  return (
    <main className="min-h-screen pt-24">
      <section className="bg-gradient-to-br from-primary to-primary-light py-10 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-2">College Comparison</h1>
          <p className="text-blue-200">Side-by-side comparison of {colleges.length} colleges</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {/* College name headers */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}>
          <div />
          {colleges.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-card p-4 text-center">
              <div
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white mb-2"
                style={{ backgroundColor: c.dgs_approval_status === 'approved' ? '#00C896' : '#FFB347' }}
              >
                <Shield className="w-3 h-3" />
                {c.dgs_approval_status === 'approved' ? 'Approved' : 'Unverified'}
              </div>
              <h2 className="font-display font-semibold text-primary text-sm leading-snug">{c.name}</h2>
              <Link href={`/colleges/${c.slug}`} className="text-xs text-accent hover:underline mt-1 inline-block">
                View Details →
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid gap-4 items-center py-3 px-4 ${i % 2 === 0 ? 'bg-surface' : 'bg-white'}`}
              style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
            >
              <span className="text-sm font-semibold text-text-muted">{row.label}</span>
              {colleges.map((c) => (
                <div key={c.id} className="text-sm text-text-primary">
                  {row.getValue(c)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/colleges" className="text-accent font-medium hover:underline text-sm">
            ← Back to College Explorer
          </Link>
        </div>
      </section>
    </main>
  )
}
