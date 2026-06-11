import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'deferred') {
    const [perfResult, testsResult, sessionsResult, notifResult, coursesResult, collegesResult] =
      await Promise.all([
        supabase.from('user_cet_performance').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('mock_test_attempts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('ai_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('user_saved_courses').select('*, courses(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('user_saved_colleges').select('*, colleges(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])

    return NextResponse.json({
      data: {
        cetPerformance: perfResult.data,
        recentTests: testsResult.data ?? [],
        recentSessions: sessionsResult.data ?? [],
        recentNotifications: notifResult.data ?? [],
        savedCourses: coursesResult.data ?? [],
        savedColleges: collegesResult.data ?? [],
      },
    })
  }

  // Critical path
  const [profileResult, eligibilityResult, cetResult, unreadResult, savedCoursesCountResult, savedCollegesCountResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('eligibility_checks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('cet_schedules').select('*').in('status', ['upcoming', 'registration_open']).order('exam_date', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
      supabase.from('user_saved_courses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_saved_colleges').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

  return NextResponse.json({
    data: {
      profile: profileResult.data,
      eligibilityStatus: eligibilityResult.data,
      cetSchedule: cetResult.data,
      unreadNotifications: unreadResult.count ?? 0,
      savedCoursesCount: savedCoursesCountResult.count ?? 0,
      savedCollegesCount: savedCollegesCountResult.count ?? 0,
    },
  })
}
