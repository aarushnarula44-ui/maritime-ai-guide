import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
export const dynamic = 'force-dynamic'

type CETPerf = Database['public']['Tables']['user_cet_performance']['Row']

interface SubmitBody {
  questions: string[]
  answers: { questionId: string; answer: 'a' | 'b' | 'c' | 'd' }[]
  timeTakenSeconds: number
  testType: 'full_mock' | 'subject_wise' | 'topic_wise'
  subjectFilter?: string
}

type DBQuestion = {
  id: string; subject: string; correct_answer: string; explanation: string | null
  question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; topic: string
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: SubmitBody = await req.json()
  const { questions: questionIds, answers, timeTakenSeconds, testType } = body

  // Fetch correct answers from DB (cet_questions not in generated types, use any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbQuestions } = await (supabase as any)
    .from('cet_questions')
    .select('id, subject, correct_answer, explanation, question_text, option_a, option_b, option_c, option_d, topic')
    .in('id', questionIds)

  const questionMap = new Map<string, DBQuestion>()
  for (const q of (dbQuestions as DBQuestion[] | null) ?? []) {
    questionMap.set(q.id, q)
  }

  const answerMap = new Map(answers.map(a => [a.questionId, a.answer]))

  const subjectBreakdown: Record<string, { correct: number; total: number }> = {}
  let score = 0

  const questionsWithAnswers = questionIds.map(qId => {
    const q = questionMap.get(qId)
    if (!q) return null
    const userAns = answerMap.get(qId)
    const isCorrect = userAns === q.correct_answer
    if (isCorrect) score++

    if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { correct: 0, total: 0 }
    subjectBreakdown[q.subject].total++
    if (isCorrect) subjectBreakdown[q.subject].correct++

    return { ...q }
  }).filter(Boolean)

  const maxScore = questionsWithAnswers.length
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0

  // Save attempt (cast needed — mock_test_attempts Insert type infers as never[] in some TS versions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('mock_test_attempts').insert({
    user_id: user.id,
    test_type: testType,
    score,
    max_score: maxScore,
    time_taken_seconds: timeTakenSeconds,
    subject_scores: subjectBreakdown,
  })

  // Update user_cet_performance
  const { data: existing } = await supabase
    .from('user_cet_performance')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const perf = existing as CETPerf | null

  if (perf) {
    const n = perf.tests_taken + 1
    const newOverall = perf.overall_avg != null ? ((perf.overall_avg * perf.tests_taken) + pct) / n : pct

    const subjectAvgs: Record<string, number | null> = {}
    for (const [subj, key] of [
      ['Mathematics', 'mathematics_avg'], ['Physics', 'physics_avg'],
      ['Chemistry', 'chemistry_avg'], ['English', 'english_avg'],
      ['General Aptitude', 'aptitude_avg'],
    ] as [string, keyof CETPerf][]) {
      const subjBreak = subjectBreakdown[subj]
      if (subjBreak) {
        const subjPct = (subjBreak.correct / subjBreak.total) * 100
        const prev = perf[key] as number | null
        subjectAvgs[key] = prev != null ? ((prev * perf.tests_taken) + subjPct) / n : subjPct
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('user_cet_performance').update({
      tests_taken: n,
      overall_avg: newOverall,
      best_score: Math.max(perf.best_score ?? 0, pct),
      ...subjectAvgs,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('user_cet_performance').insert({
      user_id: user.id,
      tests_taken: 1,
      overall_avg: pct,
      best_score: pct,
      mathematics_avg: subjectBreakdown['Mathematics'] ? (subjectBreakdown['Mathematics'].correct / subjectBreakdown['Mathematics'].total) * 100 : null,
      physics_avg: subjectBreakdown['Physics'] ? (subjectBreakdown['Physics'].correct / subjectBreakdown['Physics'].total) * 100 : null,
      chemistry_avg: subjectBreakdown['Chemistry'] ? (subjectBreakdown['Chemistry'].correct / subjectBreakdown['Chemistry'].total) * 100 : null,
      english_avg: subjectBreakdown['English'] ? (subjectBreakdown['English'].correct / subjectBreakdown['English'].total) * 100 : null,
      aptitude_avg: subjectBreakdown['General Aptitude'] ? (subjectBreakdown['General Aptitude'].correct / subjectBreakdown['General Aptitude'].total) * 100 : null,
    })
  }

  return NextResponse.json({ score, maxScore, percentage: pct, subjectBreakdown, questionsWithAnswers })
}
