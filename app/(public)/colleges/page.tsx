import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { STATIC_COLLEGES, STATIC_COLLEGE_COURSES } from '@/lib/static-data'
import { CollegeExplorer } from '@/components/colleges/CollegeExplorer'
import { ComparisonDrawer } from '@/components/colleges/ComparisonDrawer'
import type { StaticCollege } from '@/lib/static-data'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'DGS Approved Maritime Colleges in India | Maritime AI Guide',
  description:
    'Find verified DGS-approved maritime colleges in India. Compare fees, ratings, and courses. Fraud protection built-in.',
}

async function getColleges(): Promise<StaticCollege[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error || !data?.length) return STATIC_COLLEGES
    return data as StaticCollege[]
  } catch {
    return STATIC_COLLEGES
  }
}

export default async function CollegesPage() {
  const colleges = await getColleges()

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
        <CollegeExplorer colleges={colleges} collegeCourses={STATIC_COLLEGE_COURSES} />
      </section>

      <ComparisonDrawer colleges={colleges.map((c) => ({ id: c.id, name: c.name }))} />
    </main>
  )
}
