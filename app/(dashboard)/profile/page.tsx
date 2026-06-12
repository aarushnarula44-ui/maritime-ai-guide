import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Profile — Maritime AI Guide' }

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [profileRes, academicRes, eligRes, savedCoursesRes, savedCollegesRes, testsRes, perfRes] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', user.id).single(),
      sb.from('academic_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      sb.from('eligibility_checks').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
      sb.from('user_saved_courses').select('*, courses(id, name, department, duration_display)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      sb.from('user_saved_colleges').select('*, colleges(id, name, city, state, dgs_approval_status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      sb.from('mock_test_attempts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      sb.from('user_cet_performance').select('*').eq('user_id', user.id).maybeSingle(),
    ])

  if (!profileRes.data) redirect('/login')

  return (
    <ProfileClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile={profileRes.data as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      academic={academicRes.data as any}
      hasEligibility={!!eligRes.data}
      hasCourse={(savedCoursesRes.data?.length ?? 0) > 0}
      hasCollege={(savedCollegesRes.data?.length ?? 0) > 0}
      hasTest={(testsRes.data?.length ?? 0) > 0}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cetPerformance={perfRes.data as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentTests={(testsRes.data ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      savedCourses={(savedCoursesRes.data ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      savedColleges={(savedCollegesRes.data ?? []) as any}
    />
  )
}
