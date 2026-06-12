import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const MOCK_DISTRIBUTION = {
  Mathematics: 50,
  Physics: 50,
  Chemistry: 20,
  English: 40,
  'General Aptitude': 40,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Strip correct_answer before sending to client
function sanitize(q: Record<string, unknown>) {
  const { correct_answer, explanation, ...safe } = q
  void correct_answer; void explanation
  return safe
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const subject = searchParams.get('subject') || undefined
  const difficulty = searchParams.get('difficulty') || undefined
  const topicFilter = searchParams.get('topic') || undefined
  const count = Math.min(parseInt(searchParams.get('count') || '20'), 200)
  const type = searchParams.get('type') || 'practice'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  try {
    if (type === 'mock') {
      const allQuestions: Record<string, unknown>[] = []

      for (const [subj, quota] of Object.entries(MOCK_DISTRIBUTION)) {
        const { data } = await supabase
          .from('cet_questions')
          .select('id, subject, topic, question_text, option_a, option_b, option_c, option_d')
          .eq('subject', subj)
          .eq('is_active', true)
          .limit(quota * 3)

        if (data && data.length > 0) {
          const picked = shuffle(data as Record<string, unknown>[]).slice(0, quota)
          allQuestions.push(...picked)
        }
      }

      return NextResponse.json({ questions: shuffle(allQuestions).map(sanitize) })
    }

    let query = supabase
      .from('cet_questions')
      .select('id, subject, topic, question_text, option_a, option_b, option_c, option_d')
      .eq('is_active', true)

    if (subject) query = query.eq('subject', subject)
    if (difficulty && difficulty !== 'mixed') query = query.eq('difficulty', difficulty)
    if (topicFilter) query = query.eq('topic', topicFilter)

    const { data, error } = await query.limit(count * 3)

    if (error || !data) {
      return NextResponse.json({ questions: [] })
    }

    const questions = shuffle(data as Record<string, unknown>[]).slice(0, count).map(sanitize)
    return NextResponse.json({ questions })
  } catch {
    return NextResponse.json({ questions: [] })
  }
}
