import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import { createClient } from '@/lib/supabase/server'
import { STATIC_COLLEGES } from '@/lib/static-data'
import { ReviewForm } from '@/components/colleges/ReviewForm'
import { FraudReportModalTrigger } from '@/components/colleges/FraudReportModalTrigger'
import { Shield, MapPin, Star, ExternalLink, Phone, Mail, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react'
import type { StaticCollege } from '@/lib/static-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('colleges').select('name,description').eq('slug', params.slug).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any
    if (row) return {
      title: `${row.name} — Reviews, Fees & Courses | Maritime AI Guide`,
      description: row.description ?? undefined,
    }
  } catch { /* fall through */ }
  const college = STATIC_COLLEGES.find((c) => c.slug === params.slug)
  if (!college) return { title: 'College Not Found' }
  return {
    title: `${college.name} — Reviews, Fees & Courses | Maritime AI Guide`,
    description: college.description ?? undefined,
  }
}

async function getCollege(slug: string): Promise<StaticCollege | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('colleges').select('*').eq('slug', slug).single()
    if (error || !data) return STATIC_COLLEGES.find((c) => c.slug === slug) ?? null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any
    return { ...raw, rating_avg: raw.rating_avg != null ? Number(raw.rating_avg) : null } as StaticCollege
  } catch {
    return STATIC_COLLEGES.find((c) => c.slug === slug) ?? null
  }
}

interface CourseRow { slug: string; name: string; department: string; duration_display: string }
interface CollegeCourseRow { annual_fee_inr: number; seats: number | null; admission_type: string; courses: CourseRow | null }

async function getCollegeCourses(collegeId: string): Promise<CollegeCourseRow[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('college_courses')
      .select('annual_fee_inr, seats, admission_type, courses(slug, name, department, duration_display)')
      .eq('college_id', collegeId)
      .eq('is_active', true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((cc) => ({
      annual_fee_inr: cc.annual_fee_inr ?? 0,
      seats: cc.seats ?? null,
      admission_type: cc.admission_type ?? '',
      courses: cc.courses ?? null,
    }))
  } catch {
    return []
  }
}

const STATUS_COLORS: Record<string, string> = {
  approved: '#00C896',
  pending: '#FFB347',
  suspended: '#FFB347',
  not_listed: '#FF6B6B',
  flagged: '#FF6B6B',
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'DGS Approved',
  pending: 'Pending Verification',
  suspended: 'Suspended',
  not_listed: 'Not Listed (Verify Before Applying)',
  flagged: 'Flagged for Review',
}

const DOCS_REQUIRED = [
  'Class 10 Marksheet & Certificate',
  'Class 12 Marksheet & Certificate (if applicable)',
  'Birth Certificate / Aadhaar Card',
  'IMU-CET Scorecard (if applicable)',
  'Medical Fitness Certificate (ENG1)',
  'Passport-size Photographs (6)',
  'Demand Draft / Fee Receipt',
  'Transfer Certificate from last school/college',
]

const ADMISSION_STEPS = [
  { step: '1', title: 'Check Eligibility', desc: 'Verify you meet age, qualification, and medical requirements per DGS circular.' },
  { step: '2', title: 'Appear for IMU-CET', desc: 'For CET-required courses, register and appear for the Indian Maritime University Common Entrance Test.' },
  { step: '3', title: 'Application Form', desc: 'Fill and submit the college application form online or offline as per their schedule.' },
  { step: '4', title: 'Counselling & Merit List', desc: 'IMU conducts centralized counselling. Private colleges may have their own merit process.' },
  { step: '5', title: 'Document Verification', desc: 'Submit all original documents for verification at the college.' },
  { step: '6', title: 'Fee Payment', desc: 'Pay the semester/annual fees to confirm your seat. Get official receipt.' },
]

export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  const college = await getCollege(params.slug)
  if (!college) notFound()

  const isFlagged = college.dgs_approval_status === 'not_listed' || college.dgs_approval_status === 'flagged'
  const statusColor = STATUS_COLORS[college.dgs_approval_status] ?? '#94A3B8'
  const statusLabel = STATUS_LABELS[college.dgs_approval_status] ?? college.dgs_approval_status

  const coursesWithDetails = await getCollegeCourses(college.id)

  return (
    <main className="min-h-screen">
      {/* Warning Banner */}
      {isFlagged && (
        <div className="bg-danger text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold sticky top-16 z-40">
          <AlertTriangle className="w-4 h-4" />
          WARNING: This institution is {statusLabel}. Verify before paying any fees.
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[#0D2444] pt-24 pb-10 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/colleges" className="hover:text-white transition">Colleges</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/90 truncate">{college.name}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: statusColor }}
            >
              <Shield className="w-3 h-3" />
              {statusLabel}
            </span>
            {college.imu_affiliated && (
              <span className="text-xs bg-blue-500/20 text-blue-200 font-medium px-3 py-1 rounded-full">
                IMU Affiliated
              </span>
            )}
            {college.hostel_available && (
              <span className="text-xs bg-white/15 text-white px-3 py-1 rounded-full">
                Hostel Available
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{college.name}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-3">
            {(college.city || college.state) && (
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <MapPin className="w-4 h-4" />
                {[college.city, college.state].filter(Boolean).join(', ')}
              </div>
            )}
            {college.rating_avg != null && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-semibold">{college.rating_avg.toFixed(1)}</span>
                <span className="text-white/60 text-sm">({college.rating_count} reviews)</span>
              </div>
            )}
            {college.established_year && (
              <span className="text-white/60 text-sm">Est. {college.established_year}</span>
            )}
          </div>

          {college.dgs_approval_number && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm text-white/80">DGS No: {college.dgs_approval_number}</span>
              {college.last_dgs_verified && (
                <span className="text-xs text-white/50">Verified {college.last_dgs_verified}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <Tabs.Root defaultValue="overview">
          <Tabs.List className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
            {['overview', 'courses', 'admissions', 'reviews', 'contact'].map((tab) => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className="px-4 py-2.5 text-sm font-medium text-text-secondary whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent capitalize transition"
              >
                {tab === 'courses' ? 'Courses & Fees' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Overview */}
          <Tabs.Content value="overview">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-display text-xl font-bold text-primary mb-4">About</h2>
                <p className="text-text-secondary leading-relaxed">{college.description ?? 'No description available.'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-3">Key Facts</h3>
                <div className="bg-surface rounded-xl p-5 space-y-3">
                  {[
                    { label: 'Type', value: college.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) },
                    { label: 'DGS Status', value: statusLabel },
                    { label: 'IMU Affiliated', value: college.imu_affiliated ? 'Yes' : 'No' },
                    { label: 'Total Seats', value: college.total_seats ? String(college.total_seats) : 'N/A' },
                    { label: 'Hostel', value: college.hostel_available ? 'Available' : 'Not Available' },
                    { label: 'Established', value: college.established_year ? String(college.established_year) : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-sm text-text-muted">{label}</span>
                      <span className="text-sm font-medium text-text-primary text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Courses & Fees */}
          <Tabs.Content value="courses">
            <h2 className="font-display text-xl font-bold text-primary mb-6">Courses & Fees</h2>
            {coursesWithDetails.length === 0 ? (
              <p className="text-text-muted">No course data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 font-semibold text-text-primary">Course</th>
                      <th className="text-left py-3 pr-4 font-semibold text-text-primary">Department</th>
                      <th className="text-left py-3 pr-4 font-semibold text-text-primary">Duration</th>
                      <th className="text-left py-3 pr-4 font-semibold text-text-primary">Annual Fees</th>
                      <th className="text-left py-3 pr-4 font-semibold text-text-primary">Seats</th>
                      <th className="text-left py-3 font-semibold text-text-primary">Admission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursesWithDetails.map((cc, i) => (
                      <tr key={cc.courses?.slug ?? i} className="border-b border-border hover:bg-surface transition">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/courses/${cc.courses?.slug ?? ''}`}
                            className="font-medium text-primary hover:text-accent transition"
                          >
                            {cc.courses?.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 capitalize text-text-secondary">{cc.courses?.department}</td>
                        <td className="py-3 pr-4 text-text-secondary">{cc.courses?.duration_display}</td>
                        <td className="py-3 pr-4 font-semibold text-primary">
                          ₹{cc.annual_fee_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{cc.seats ?? '—'}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            cc.admission_type === 'cet_only'
                              ? 'bg-warning/15 text-warning'
                              : 'bg-success/15 text-success'
                          }`}>
                            {cc.admission_type === 'cet_only' ? 'IMU CET' : cc.admission_type === 'both' ? 'CET / Direct' : cc.admission_type === 'own_exam' ? 'Own Exam' : 'Direct'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs.Content>

          {/* Admissions */}
          <Tabs.Content value="admissions">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-bold text-primary mb-6">Admission Process</h2>
              <div className="space-y-4 mb-8">
                {ADMISSION_STEPS.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{s.title}</h3>
                      <p className="text-sm text-text-secondary mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-primary mb-4">Documents Required</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {DOCS_REQUIRED.map((doc) => (
                  <div key={doc} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Content>

          {/* Reviews */}
          <Tabs.Content value="reviews">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-bold text-primary mb-2">Student Reviews</h2>
              {college.rating_avg != null && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-bold text-primary">{college.rating_avg.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5" fill={s <= Math.round(college.rating_avg ?? 0) ? '#FFB347' : 'none'} stroke="#FFB347" />
                      ))}
                    </div>
                    <p className="text-sm text-text-muted">{college.rating_count} reviews</p>
                  </div>
                </div>
              )}
              <p className="text-text-secondary text-sm mb-6">No reviews yet. Be the first!</p>
              <ReviewForm collegeId={college.id} />
            </div>
          </Tabs.Content>

          {/* Contact */}
          <Tabs.Content value="contact">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-bold text-primary mb-6">Contact Information</h2>
              <div className="bg-white rounded-xl shadow-card p-5 space-y-4 mb-6">
                {college.address && (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                    <p className="text-text-secondary text-sm">{college.address}</p>
                  </div>
                )}
                {college.phone && (
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <a href={`tel:${college.phone}`} className="text-sm text-accent hover:underline">{college.phone}</a>
                  </div>
                )}
                {college.email && (
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <a href={`mailto:${college.email}`} className="text-sm text-accent hover:underline">{college.email}</a>
                  </div>
                )}
                {college.website && (
                  <div className="flex gap-3">
                    <ExternalLink className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                      {college.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-3">
                  Found inaccurate information or suspected fraud?
                </p>
                <FraudReportModalTrigger collegeId={college.id} collegeName={college.name} />
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </main>
  )
}
