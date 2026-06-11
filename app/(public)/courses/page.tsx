import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { STATIC_COURSES } from '@/lib/static-data'
import { CourseExplorer } from '@/components/courses/CourseExplorer'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Maritime Courses in India — 8 DGS Approved Paths | Maritime AI Guide',
  description:
    'Explore all 8 official DGS-approved maritime career paths in India. Compare B.Sc. Nautical Science, DNS, BE Marine Engineering, GME, ETO, GP Rating and more.',
}

async function getCourses() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('department')
    if (error || !data?.length) return STATIC_COURSES
    return data
  } catch {
    return STATIC_COURSES
  }
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] min-h-[220px] flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            DGS Approved Courses
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
            Explore Maritime Career Paths
          </h1>
          <p className="text-blue-200 text-lg max-w-xl">
            8 official DGS-approved pathways. Find the one built for you.
          </p>
        </div>
      </section>

      {/* Explorer */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <CourseExplorer courses={courses} />
      </section>
    </main>
  )
}
