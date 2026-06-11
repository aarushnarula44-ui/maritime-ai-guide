import { NextRequest, NextResponse } from 'next/server'
import { STATIC_COURSES, STATIC_COLLEGES } from '@/lib/static-data'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()
  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [], colleges: [] })
  }

  // Try Supabase first, fallback to static
  let courses = STATIC_COURSES
  let colleges = STATIC_COLLEGES

  try {
    const supabase = createClient()
    const [{ data: cData }, { data: colData }] = await Promise.all([
      supabase.from('courses').select('id,slug,name,short_name,department,duration_display,salary_display').eq('is_active', true),
      supabase.from('colleges').select('id,slug,name,city,state,dgs_approval_status,rating_avg').eq('is_active', true),
    ])
    if (cData?.length) courses = cData as typeof STATIC_COURSES
    if (colData?.length) colleges = colData as typeof STATIC_COLLEGES
  } catch {
    // use static
  }

  const matchedCourses = courses
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.short_name?.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, subtitle: `${c.department} · ${c.duration_display}`, type: 'course' }))

  const matchedColleges = colleges
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, subtitle: [c.city, c.state].filter(Boolean).join(', '), type: 'college' }))

  return NextResponse.json({ courses: matchedCourses, colleges: matchedColleges })
}
