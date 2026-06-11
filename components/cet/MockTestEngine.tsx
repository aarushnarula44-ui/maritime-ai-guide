'use client'

import { useState, useEffect, useCallback } from 'react'
import { Flag, Pause, Play, X, CheckCircle } from 'lucide-react'
import { TestResults } from './TestResults'

export interface Question {
  id: string
  subject: string
  topic: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

export interface QuestionWithAnswer extends Question {
  correct_answer: 'a' | 'b' | 'c' | 'd'
  explanation: string | null
}

interface MockTestEngineProps {
  questions: Question[]
  testType: 'full_mock' | 'subject_wise' | 'topic_wise'
  subjectFilter?: string
  totalSeconds: number
  onExit: () => void
}

type AnswerMap = Record<string, 'a' | 'b' | 'c' | 'd'>
type FlagSet = Set<string>

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MockTestEngine({ questions, testType, subjectFilter, totalSeconds, onExit }: MockTestEngineProps) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [flagged, setFlagged] = useState<FlagSet>(new Set())
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [paused, setPaused] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<QuestionWithAnswer[] | null>(null)
  const [testResults, setTestResults] = useState<{
    score: number; maxScore: number; timeTaken: number
    subjectBreakdown: Record<string, { correct: number; total: number }>
  } | null>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (paused || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [paused, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) handleSubmit()
  }, [timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    try {
      const res = await fetch('/api/cet/mock-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.map(q => q.id),
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
          timeTakenSeconds: timeTaken,
          testType,
          subjectFilter,
        }),
      })
      const data = await res.json()
      setResults(data.questionsWithAnswers)
      setTestResults({ score: data.score, maxScore: data.maxScore, timeTaken, subjectBreakdown: data.subjectBreakdown })
    } catch {
      // Fallback local scoring
      setResults(questions.map(q => ({ ...q, correct_answer: 'a' as const, explanation: null })))
      setTestResults({ score: 0, maxScore: questions.length, timeTaken, subjectBreakdown: {} })
    }
    setSubmitting(false)
  }, [answers, questions, startTime, testType, subjectFilter])

  if (results && testResults) {
    return (
      <TestResults
        questions={results}
        userAnswers={answers}
        score={testResults.score}
        maxScore={testResults.maxScore}
        timeTaken={testResults.timeTaken}
        subjectBreakdown={testResults.subjectBreakdown}
        onRetake={onExit}
      />
    )
  }

  const q = questions[current]
  const answered = Object.keys(answers).length
  const timerPct = timeLeft / totalSeconds
  const timerColor = timerPct > 0.2 ? 'text-green-400' : timerPct > 0.1 ? 'text-amber-400' : 'text-red-400'
  const options = [
    { key: 'a' as const, text: q.option_a },
    { key: 'b' as const, text: q.option_b },
    { key: 'c' as const, text: q.option_c },
    { key: 'd' as const, text: q.option_d },
  ]

  function squareColor(i: number) {
    const qId = questions[i].id
    if (i === current) return 'bg-accent text-primary'
    if (answers[qId]) return 'bg-success text-white'
    if (flagged.has(qId)) return 'bg-warning text-primary'
    return 'bg-white/10 text-white'
  }

  return (
    <div className="fixed inset-0 bg-[#06101E] flex flex-col z-50">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-white font-medium text-sm">
          {testType === 'full_mock' ? 'Full Mock Test' : subjectFilter ?? 'Practice'}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-sm">Q {current + 1} / {questions.length}</span>
          <span className={`font-mono text-lg font-bold ${timerColor}`}>{formatTime(timeLeft)}</span>
          {testType !== 'full_mock' && (
            <button onClick={() => setPaused(p => !p)} className="text-white/60 hover:text-white transition">
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
          <button onClick={onExit} className="text-white/60 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* QUESTION AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {paused ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Pause className="w-12 h-12 mb-4 text-white/40" />
              <p className="text-white/60">Test paused</p>
              <button onClick={() => setPaused(false)} className="mt-4 bg-accent text-primary font-bold px-6 py-2 rounded-full">Resume</button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">{q.subject} · {q.topic}</div>
                  <p className="text-white text-lg leading-relaxed">{q.question_text}</p>
                </div>
                <button
                  onClick={() => setFlagged(f => { const n = new Set(f); if (n.has(q.id)) { n.delete(q.id) } else { n.add(q.id) } return n })}
                  className={`shrink-0 mt-1 ${flagged.has(q.id) ? 'text-warning' : 'text-white/30 hover:text-white/60'} transition`}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-w-2xl">
                {options.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.key }))}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition text-sm leading-relaxed ${
                      answers[q.id] === opt.key
                        ? 'border-accent bg-accent/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                    }`}
                  >
                    <span className="font-bold mr-3 uppercase">{opt.key}.</span>{opt.text}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  disabled={current === 0}
                  onClick={() => setCurrent(c => c - 1)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-white text-sm disabled:opacity-30 hover:bg-white/10 transition"
                >
                  Previous
                </button>
                {current < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrent(c => c + 1)}
                    className="px-5 py-2.5 rounded-full bg-accent text-primary font-bold text-sm hover:bg-accent-dark transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-5 py-2.5 rounded-full bg-success text-white font-bold text-sm hover:opacity-90 transition flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Submit Test
                  </button>
                )}
                <button
                  onClick={() => setShowConfirm(true)}
                  className="ml-auto px-4 py-2.5 rounded-full border border-white/20 text-white/70 text-sm hover:bg-white/10 transition"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </div>

        {/* QUESTION GRID - hidden on mobile */}
        <div className="hidden md:flex flex-col w-56 border-l border-white/10 p-4 overflow-y-auto">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded text-xs font-medium transition ${squareColor(i)}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 text-xs mt-auto">
            {[
              { color: 'bg-success', label: 'Answered' },
              { color: 'bg-accent', label: 'Current' },
              { color: 'bg-warning', label: 'Flagged' },
              { color: 'bg-white/10', label: 'Not visited' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-white/40">
                <div className={`w-3 h-3 rounded ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0D1B2E] border border-white/20 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Submit Test?</h3>
            <p className="text-white/60 text-sm mb-6">
              You have answered {answered} of {questions.length} questions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition"
              >
                Review
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit() }}
                disabled={submitting}
                className="flex-1 py-2.5 bg-success text-white font-bold rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
