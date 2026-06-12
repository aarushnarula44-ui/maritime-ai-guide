import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import { createClient } from '@/lib/supabase/server'
import { STATIC_COURSES, STATIC_COLLEGES, STATIC_COLLEGE_COURSES } from '@/lib/static-data'
import { SalaryChart } from '@/components/courses/SalaryChart'
import { Shield, Clock, Users, BookOpen, ChevronRight, AlertCircle } from 'lucide-react'

export const revalidate = 86400

const DECK_CAREER = [
  { rank: 'Deck Cadet', code: 'DC', yearsMin: 0, yearsMax: 0, salaryMin: 400, salaryMax: 800, cocRequired: null },
  { rank: 'Officer of the Watch (3rd Officer)', code: '3/O', yearsMin: 1, yearsMax: 2, salaryMin: 1200, salaryMax: 2500, cocRequired: 'CoC OICNW' },
  { rank: 'Second Officer', code: '2/O', yearsMin: 3, yearsMax: 5, salaryMin: 2500, salaryMax: 4500, cocRequired: 'CoC 2nd Mate' },
  { rank: 'Chief Officer', code: 'C/O', yearsMin: 6, yearsMax: 9, salaryMin: 4500, salaryMax: 8000, cocRequired: 'CoC 1st Mate' },
  { rank: 'Captain / Master', code: 'MASTER', yearsMin: 10, yearsMax: 15, salaryMin: 8000, salaryMax: 15000, cocRequired: 'Master CoC' },
]

const ENGINE_CAREER = [
  { rank: 'Engine Cadet', code: 'EC', yearsMin: 0, yearsMax: 0, salaryMin: 400, salaryMax: 800, cocRequired: null },
  { rank: '4th Engineer', code: '4/E', yearsMin: 1, yearsMax: 2, salaryMin: 1500, salaryMax: 3000, cocRequired: 'CoC OICEW' },
  { rank: '3rd Engineer', code: '3/E', yearsMin: 2, yearsMax: 4, salaryMin: 3000, salaryMax: 5000, cocRequired: 'CoC 3rd Engr' },
  { rank: '2nd Engineer', code: '2/E', yearsMin: 5, yearsMax: 8, salaryMin: 5000, salaryMax: 10000, cocRequired: 'CoC 2nd Engr' },
  { rank: 'Chief Engineer', code: 'C/E', yearsMin: 9, yearsMax: 15, salaryMin: 8000, salaryMax: 20000, cocRequired: 'Chief Engr CoC' },
]

const ETO_CAREER = [
  { rank: 'ETO Trainee', code: 'ET', yearsMin: 0, yearsMax: 0, salaryMin: 2500, salaryMax: 3500, cocRequired: null },
  { rank: 'Electro-Technical Officer', code: 'ETO', yearsMin: 1, yearsMax: 5, salaryMin: 3500, salaryMax: 7000, cocRequired: 'ETO CoC' },
]

const RATING_CAREER = [
  { rank: 'GP Rating (Trainee)', code: 'GPR', yearsMin: 0, yearsMax: 0, salaryMin: 600, salaryMax: 1000, cocRequired: null },
  { rank: 'Able Seaman (AB)', code: 'AB', yearsMin: 1, yearsMax: 3, salaryMin: 1000, salaryMax: 2000, cocRequired: 'AB CoC' },
]

const CATERING_CAREER = [
  { rank: 'Trainee Cook/Steward', code: 'TC', yearsMin: 0, yearsMax: 0, salaryMin: 500, salaryMax: 800, cocRequired: null },
  { rank: 'Ship Cook / Chief Cook', code: 'CC', yearsMin: 1, yearsMax: 5, salaryMin: 800, salaryMax: 1500, cocRequired: null },
]

function getCareer(dept: string) {
  if (dept === 'deck') return DECK_CAREER
  if (dept === 'engine') return ENGINE_CAREER
  if (dept === 'eto') return ETO_CAREER
  if (dept === 'ratings') return RATING_CAREER
  if (dept === 'catering') return CATERING_CAREER
  return DECK_CAREER
}

const DEPT_COLORS: Record<string, string> = {
  deck: '#1E3A5F',
  engine: '#0F4C35',
  eto: '#3D1A6E',
  ratings: '#1A4A2E',
  catering: '#4A2A1A',
}

const STUDY_TOPICS: Record<string, string[]> = {
  deck: ['Navigation & Chartwork', 'Meteorology', 'Seamanship', 'Ship Stability', 'COLREGS', 'GMDSS', 'Fire Fighting', 'Marine Law'],
  engine: ['Marine Diesel Engines', 'Thermodynamics', 'Fluid Mechanics', 'Electrical Engineering', 'Marine Systems', 'Workshop Practice', 'Ship Stability', 'Safety & STCW'],
  eto: ['Marine Electrical Systems', 'Electronics & Automation', 'Navigation Electronics', 'GMDSS', 'Radar Systems', 'Safety'],
  ratings: ['Seamanship', 'Safety at Sea', 'Fire Fighting', 'First Aid', 'Cargo Handling', 'Watchkeeping'],
  catering: ['Food Safety & Hygiene', 'Ship Catering Management', 'Cooking Techniques', 'Safety & STCW', 'Steward Duties'],
}

export async function generateStaticParams() {
  return STATIC_COURSES.map((c) => ({ slug: c.slug }))
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maritimeaiguide.in'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const course = STATIC_COURSES.find((c) => c.slug === params.slug)
  if (!course) return { title: 'Course Not Found' }
  return {
    title: `${course.name} — Eligibility, Salary & Colleges | Maritime AI Guide`,
    description: course.description ?? `Learn about ${course.name}: eligibility requirements, salary expectations, duration, and top DGS-approved colleges in India.`,
    openGraph: {
      title: `${course.name} — Eligibility, Salary & Colleges`,
      description: course.description ?? undefined,
      url: `${BASE_URL}/courses/${course.slug}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    alternates: { canonical: `${BASE_URL}/courses/${course.slug}` },
  }
}

async function getCourse(slug: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return STATIC_COURSES.find((c) => c.slug === slug) ?? null
    return data
  } catch {
    return STATIC_COURSES.find((c) => c.slug === slug) ?? null
  }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug)
  if (!course) notFound()

  const deptColor = course.banner_color ?? DEPT_COLORS[course.department] ?? '#1E3A5F'
  const career = getCareer(course.department)
  const topics = STUDY_TOPICS[course.department] ?? []

  // Colleges offering this course
  const collegeCourses = STATIC_COLLEGE_COURSES.filter((cc) => cc.course_slug === course.slug)
  const collegesToShow = collegeCourses.map((cc) => ({
    ...STATIC_COLLEGES.find((col) => col.slug === cc.college_slug)!,
    annual_fees: cc.annual_fees,
    seats: cc.seats,
    admission_type: cc.admission_type,
  })).filter(Boolean)

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description ?? undefined,
    url: `${BASE_URL}/courses/${course.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'Directorate General of Shipping, India',
      url: 'https://dgshipping.gov.in',
    },
    educationalCredentialAwarded: course.name,
    timeRequired: course.duration_display ?? undefined,
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {/* Hero */}
      <section
        className="pt-24 pb-10 text-white"
        style={{ background: `linear-gradient(135deg, ${deptColor} 0%, #0A1628 100%)` }}
      >
        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/courses" className="hover:text-white transition">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/90 truncate">{course.short_name ?? course.name}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              {course.department}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> {course.duration_display}
            </span>
            {course.cet_required && (
              <span className="text-xs font-semibold bg-warning/20 text-warning px-3 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> IMU-CET Required
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">{course.name}</h1>
          {course.description && (
            <p className="text-white/80 text-lg max-w-2xl mb-6 leading-relaxed">{course.description}</p>
          )}

          {course.salary_display && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-6">
              <span className="text-white/70 text-sm">Salary Range:</span>
              <span className="text-accent font-bold">{course.salary_display}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 bg-accent text-primary font-bold py-3 px-6 rounded-full hover:bg-accent-dark transition"
            >
              Check My Eligibility
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 border border-white/30 text-white py-3 px-6 rounded-full hover:bg-white/10 transition"
            >
              Find Colleges
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <Tabs.Root defaultValue="overview">
          <Tabs.List className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
            {['overview', 'eligibility', 'career', 'salary', 'colleges'].map((tab) => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className="px-4 py-2.5 text-sm font-medium text-text-secondary whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent capitalize transition"
              >
                {tab === 'career' ? 'Career Path' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Overview */}
          <Tabs.Content value="overview">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-display text-xl font-bold text-primary mb-4">About This Course</h2>
                <p className="text-text-secondary leading-relaxed mb-6">{course.description}</p>

                <h3 className="font-semibold text-primary mb-3">What You Will Study</h3>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-text-secondary">
                      <BookOpen className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-3">Key Facts</h3>
                <div className="bg-surface rounded-xl p-5 space-y-3">
                  {[
                    { label: 'Duration', value: course.duration_display },
                    { label: 'Department', value: course.department.toUpperCase() },
                    { label: 'CET Required', value: course.cet_required ? 'Yes (IMU-CET)' : 'No' },
                    { label: 'Max Age', value: course.display_max_age ? `${course.display_max_age} years` : 'N/A' },
                    { label: 'Salary Range', value: course.salary_display ?? 'N/A' },
                    { label: 'DGS Source', value: course.source_circular ?? 'DGS Circular 2020' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-sm text-text-muted">{label}</span>
                      <span className="text-sm font-medium text-text-primary text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-primary">DGS Verified</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    This course is approved under {course.source_circular ?? 'DGS Training Circular No. 12 of 2020'}.
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Eligibility */}
          <Tabs.Content value="eligibility">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-bold text-primary mb-2">Eligibility Requirements</h2>
              <p className="text-text-secondary text-sm mb-6">
                Source: {course.source_circular ?? 'DGS Training Circular No. 12 of 2020'}
              </p>
              <div className="space-y-4">
                {course.department === 'deck' && (
                  <>
                    <EligibilityRow label="Qualification" value="Class 12 with Physics, Chemistry & Mathematics (PCM)" />
                    <EligibilityRow label="PCM Percentage" value="Minimum 60% aggregate in PCM subjects" />
                    <EligibilityRow label="English" value="Minimum 50% in English (Class 10 or 12)" />
                    <EligibilityRow label="Maximum Age" value={`${course.display_max_age} years on date of joining`} />
                    <EligibilityRow label="Gender" value="Male and Female candidates eligible" />
                    <EligibilityRow label="Medical" value="Fit as per ENG1 medical standards" />
                  </>
                )}
                {course.department === 'engine' && course.cet_required && (
                  <>
                    <EligibilityRow label="Qualification" value="Class 12 with Physics, Chemistry & Mathematics (PCM)" />
                    <EligibilityRow label="PCM Percentage" value="Minimum 60% aggregate in PCM subjects" />
                    <EligibilityRow label="English" value="Minimum 50% in English (Class 10 or 12)" />
                    <EligibilityRow label="Maximum Age" value={`${course.display_max_age} years on date of joining`} />
                    <EligibilityRow label="Medical" value="Fit as per ENG1 medical standards" />
                  </>
                )}
                {course.department === 'engine' && !course.cet_required && (
                  <>
                    <EligibilityRow label="Qualification" value="BE/B.Tech in Mechanical or Electrical Engineering" />
                    <EligibilityRow label="Aggregate" value="Minimum 50% aggregate in graduation" />
                    <EligibilityRow label="Maximum Age" value={`${course.display_max_age} years on date of joining`} />
                    <EligibilityRow label="Medical" value="Fit as per ENG1 medical standards" />
                  </>
                )}
                {course.department === 'eto' && (
                  <>
                    <EligibilityRow label="Qualification" value="BE/B.Tech in Electrical, Electronics or Instrumentation" />
                    <EligibilityRow label="Maximum Age" value={`${course.display_max_age} years on date of joining`} />
                    <EligibilityRow label="Medical" value="Fit as per ENG1 medical standards" />
                  </>
                )}
                {(course.department === 'ratings' || course.department === 'catering') && (
                  <>
                    <EligibilityRow label="Qualification" value="Class 10 (SSC) from a recognised board" />
                    <EligibilityRow label="Maximum Age" value={`${course.display_max_age} years on date of joining`} />
                    <EligibilityRow label="Medical" value="Fit as per ENG1 medical standards" />
                  </>
                )}
              </div>
              <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
                <p className="text-sm text-text-secondary">
                  Want to check if <strong>you specifically</strong> are eligible?
                </p>
                <Link href="/eligibility" className="mt-2 inline-flex items-center gap-1 text-accent font-semibold text-sm hover:underline">
                  Use Our Eligibility Checker →
                </Link>
              </div>
            </div>
          </Tabs.Content>

          {/* Career Path */}
          <Tabs.Content value="career">
            <h2 className="font-display text-xl font-bold text-primary mb-6">Career Progression</h2>
            <div className="relative">
              {career.map((step, idx) => (
                <div key={step.code} className="flex gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: deptColor }}
                    >
                      {step.code.length <= 3 ? step.code : `${idx + 1}`}
                    </div>
                    {idx < career.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-8 flex-1">
                    <h3 className="font-semibold text-primary">{step.rank}</h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="text-sm text-text-secondary">
                        {step.yearsMin === 0 && step.yearsMax === 0
                          ? 'Entry level'
                          : `${step.yearsMin}–${step.yearsMax} years`}
                      </span>
                      <span className="text-sm font-medium text-accent">
                        ${step.salaryMin.toLocaleString()} – ${step.salaryMax.toLocaleString()}/mo
                      </span>
                      {step.cocRequired && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {step.cocRequired}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>

          {/* Salary */}
          <Tabs.Content value="salary">
            <h2 className="font-display text-xl font-bold text-primary mb-2">Salary Progression</h2>
            <div className="bg-white rounded-xl shadow-card p-6">
              <SalaryChart career={career} />
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {career.map((step) => (
                <div key={step.code} className="bg-surface rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-primary text-sm">{step.rank}</p>
                    {step.yearsMin > 0 && (
                      <p className="text-xs text-text-muted mt-0.5">{step.yearsMin}–{step.yearsMax} yrs exp</p>
                    )}
                  </div>
                  <p className="text-accent font-bold text-sm">
                    ${step.salaryMin.toLocaleString()} – ${step.salaryMax.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Tabs.Content>

          {/* Colleges */}
          <Tabs.Content value="colleges">
            <h2 className="font-display text-xl font-bold text-primary mb-6">
              Colleges Offering {course.short_name ?? course.name}
            </h2>
            {collegesToShow.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No colleges listed yet.</p>
                <Link href="/colleges" className="mt-2 text-accent font-medium hover:underline inline-block">
                  Browse All Colleges →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {collegesToShow.map((col) => col && (
                  <div
                    key={col.slug}
                    className="bg-white rounded-xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold text-primary">{col.name}</h3>
                      <p className="text-sm text-text-secondary mt-0.5">{[col.city, col.state].filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Annual Fees</p>
                        <p className="font-bold text-primary">₹{col.annual_fees.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Seats</p>
                        <p className="font-bold text-primary">{col.seats}</p>
                      </div>
                      <Link
                        href={`/colleges/${col.slug}`}
                        className="text-sm font-semibold text-accent hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </main>
  )
}

function EligibilityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 p-4 bg-surface rounded-xl">
      <span className="text-sm font-semibold text-primary w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-text-secondary">{value}</span>
    </div>
  )
}
