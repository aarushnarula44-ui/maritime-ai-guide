import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { STATIC_COLLEGES, STATIC_COLLEGE_COURSES } from '@/lib/static-data'
import { CollegeExplorer } from '@/components/colleges/CollegeExplorer'
import { ComparisonDrawer } from '@/components/colleges/ComparisonDrawer'
import type { StaticCollege, StaticCollegeCourse } from '@/lib/static-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'DGS Approved Maritime Colleges in India | Maritime AI Guide',
  description:
    'Find verified DGS-approved maritime colleges in India. Compare fees, ratings, and courses. Fraud protection built-in.',
}

async function getData(): Promise<{ colleges: StaticCollege[]; courses: StaticCollegeCourse[] }> {
  try {
    const supabase = createClient()

    const [collegesRes, coursesRes] = await Promise.all([
      supabase.from('colleges').select('*').eq('is_active', true).order('name'),
      supabase
        .from('college_courses')
        .select('college_id, course_id, annual_fee_inr, seats, admission_type, courses(slug)')
        .eq('is_active', true),
    ])

    if (collegesRes.error || !collegesRes.data?.length) {
      return { colleges: STATIC_COLLEGES, courses: STATIC_COLLEGE_COURSES }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawColleges = collegesRes.data as any[]
    const colleges: StaticCollege[] = rawColleges.map((c) => ({
      ...c,
      rating_avg: c.rating_avg != null ? Number(c.rating_avg) : null,
    }))

    const collegeSlugMap = Object.fromEntries(colleges.map((c) => [c.id, c.slug]))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawCourses = (coursesRes.data ?? []) as any[]
    const collegeCourses: StaticCollegeCourse[] = rawCourses.map((cc) => ({
      college_id: cc.college_id,
      college_slug: collegeSlugMap[cc.college_id] ?? '',
      course_id: cc.course_id,
      course_slug: cc.courses?.slug ?? '',
      annual_fees: cc.annual_fee_inr ?? 0,
      seats: cc.seats ?? 0,
      admission_type: cc.admission_type ?? '',
    }))

    return { colleges, courses: collegeCourses.length ? collegeCourses : STATIC_COLLEGE_COURSES }
  } catch {
    return { colleges: STATIC_COLLEGES, courses: STATIC_COLLEGE_COURSES }
  }
}

export default async function CollegesPage() {
  const { colleges, courses } = await getData()

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] min-h-[220px] flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            Verified Colleges
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
            Find DGS Approved Colleges
          </h1>
          <p className="text-blue-200 text-lg max-w-xl">
            Every college cross-verified against official DGS records. Fraud warnings built-in.
          </p>
        </div>
      </section>

      {/* Explorer */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <CollegeExplorer colleges={colleges} collegeCourses={courses} />
      </section>

      <ComparisonDrawer colleges={colleges.map((c) => ({ id: c.id, name: c.name }))} />
    </main>
  )
}
