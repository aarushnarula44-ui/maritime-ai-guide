import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DashboardClient } from './DashboardClient'
export const dynamic = 'force-dynamic'

function ProfileRing({ pct }: { pct: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="#00D4FF" strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{pct}%</text>
      </svg>
      <span className="text-blue-200 text-xs mt-1">Profile Complete</span>
    </div>
  )
}

function calcProfileCompletion(profile: Record<string, unknown> | null, academic: Record<string, unknown> | null, hasEligibility: boolean, hasCourse: boolean, hasCollege: boolean) {
  let score = 0
  if (profile?.full_name) score += 15
  if (profile?.email) score += 15
  if (profile?.phone) score += 10
  if (profile?.date_of_birth) score += 10
  if (academic) score += 20
  if (hasEligibility) score += 15
  if (hasCourse) score += 8
  if (hasCollege) score += 7
  return Math.min(100, score)
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Critical path: parallel fetch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const uid = user?.id ?? ''
  const [profileRes, eligRes, cetRes, unreadRes, savedCoursesRes, savedCollegesRes, academicRes] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
      sb.from('eligibility_checks').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      sb.from('cet_schedules').select('*').in('status', ['upcoming', 'registration_open']).order('exam_date', { ascending: true }).limit(1).maybeSingle(),
      sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false),
      sb.from('user_saved_courses').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      sb.from('user_saved_colleges').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      sb.from('academic_profiles').select('*').eq('user_id', uid).maybeSingle(),
    ])

  const profile = profileRes.data
  const eligibility = eligRes.data
  const cetSchedule = cetRes.data
  const unreadCount = unreadRes.count ?? 0
  const savedCoursesCount = savedCoursesRes.count ?? 0
  const savedCollegesCount = savedCollegesRes.count ?? 0
  const academic = academicRes.data

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const eligibleResults = (eligibility?.results as { eligible?: boolean; course_id?: string; course_name?: string; department?: string; score?: number }[] | null) ?? []
  const eligibleCourses = eligibleResults.filter((r) => r.eligible)

  let subtitle = 'Let us find the right path for you.'
  if (eligibility && eligibleCourses.length > 0) subtitle = `You qualify for ${eligibleCourses.length} courses. Here is what to do next.`
  else if (!eligibility) subtitle = 'Start by checking your eligibility.'

  const profileCompletion = calcProfileCompletion(
    profile as Record<string, unknown> | null,
    academic as Record<string, unknown> | null,
    !!eligibility,
    savedCoursesCount > 0,
    savedCollegesCount > 0,
  )

  // CET countdown
  let cetDaysRemaining: number | null = null
  if (cetSchedule?.exam_date) {
    const diff = new Date(cetSchedule.exam_date).getTime() - Date.now()
    cetDaysRemaining = Math.max(0, Math.ceil(diff / 86400000))
  }

  return (
    <div className="-mx-4 md:-mx-8 -mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light px-4 md:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-blue-200 mt-1 text-sm">{subtitle}</p>
        </div>

        <div className="flex items-center gap-8">
          <ProfileRing pct={profileCompletion} />
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{eligibleCourses.length}</p>
              <p className="text-blue-200 text-xs mt-0.5">Eligible Courses</p>
            </div>
            <div className="text-center">
              {cetSchedule?.status === 'registration_open' ? (
                <>
                  <p className="text-accent text-sm font-bold">Register Now</p>
                  <p className="text-blue-200 text-xs mt-0.5">CET Status</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-accent">{cetDaysRemaining ?? '—'}</p>
                  <p className="text-blue-200 text-xs mt-0.5">CET Days</p>
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{savedCoursesCount + savedCollegesCount}</p>
              <p className="text-blue-200 text-xs mt-0.5">Saved Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid — critical path cards */}
      <div className="grid grid-cols-12 gap-6 px-4 md:px-8 py-8">
        {/* Card 1: Eligibility Status */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">My Eligibility Status</h2>
            <Link href="/eligibility" className="text-sm text-accent hover:underline font-medium">Update →</Link>
          </div>

          {eligibility && eligibleCourses.length > 0 ? (
            <div>
              <div className="space-y-2 mb-4">
                {eligibleCourses.slice(0, 3).map((course) => (
                  <div key={course.course_id} className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-text-primary">{course.course_name}</span>
                      {course.department && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{course.department}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Eligible</span>
                      <Link href={`/courses/${course.course_id}`} className="text-xs text-accent hover:underline">Explore →</Link>
                    </div>
                  </div>
                ))}
              </div>
              {eligibility.score != null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-accent">{eligibility.score}</span>
                    <span className="text-text-muted text-lg">/100</span>
                  </div>
                  <Link href="/eligibility" className="text-sm text-accent hover:underline font-medium">View Full Report →</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎓</div>
              <p className="text-text-secondary text-sm mb-4">You have not checked your eligibility yet</p>
              <Link href="/eligibility" className="inline-block bg-accent text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition">
                Check My Eligibility →
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: CET Countdown */}
        <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white">
          <h2 className="text-blue-300 text-sm font-medium mb-3">IMU-CET 2025</h2>

          {cetSchedule ? (
            <>
              {cetSchedule.status === 'registration_open' ? (
                <div className="mb-4">
                  <p className="font-display text-2xl font-bold text-accent">Registration Open!</p>
                  {cetSchedule.registration_end && (
                    <p className="text-blue-200 text-sm mt-1">
                      Register by {new Date(cetSchedule.registration_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <p className="font-display text-5xl font-bold text-accent">{cetDaysRemaining}</p>
                  <p className="text-blue-200 text-sm mt-1">Days to CET Exam</p>
                </div>
              )}
            </>
          ) : (
            <div className="mb-4">
              <p className="font-display text-xl font-bold text-white">CET dates not announced yet</p>
              <p className="text-blue-200 text-sm mt-1">We will notify you</p>
            </div>
          )}

          <div className="space-y-1 mb-4">
            <Link href="/cet" className="block text-sm text-blue-200 hover:text-white hover:underline">View Syllabus →</Link>
            <Link href="/cet/practice" className="block text-sm text-blue-200 hover:text-white hover:underline">Practice Tests →</Link>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-300">Your CET Readiness</span>
              <span className="text-accent font-semibold">—</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div className="h-full bg-accent rounded-full w-0" />
            </div>
            <p className="text-blue-300 text-xs mt-1">Not started</p>
          </div>
        </div>
      </div>

      {/* Deferred cards rendered by client component */}
      <DashboardClient unreadNotifications={unreadCount} />
    </div>
  )
}
