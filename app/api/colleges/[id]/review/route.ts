import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please log in to submit a review.' }, { status: 401 })

    const body = await req.json()
    const { overall, teaching, placement, facilities, reviewText, courseAttended, graduationYear } = body

    if (!overall || overall < 1 || overall > 5) {
      return NextResponse.json({ error: 'Invalid rating.' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('college_reviews').insert({
      college_id: params.id,
      user_id: user.id,
      rating_overall: overall,
      rating_teaching: teaching || null,
      rating_placement: placement || null,
      rating_facilities: facilities || null,
      review_text: reviewText || null,
      course_attended: courseAttended || null,
      graduation_year: graduationYear || null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
