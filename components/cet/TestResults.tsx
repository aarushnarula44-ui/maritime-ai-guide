'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { QuestionWithAnswer } from './MockTestEngine'

interface TestResultsProps {
  questions: QuestionWithAnswer[]
  userAnswers: Record<string, 'a' | 'b' | 'c' | 'd'>
  score: number
  maxScore: number
  timeTaken: number
  subjectBreakdown: Record<string, { correct: number; total: number }>
  onRetake: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function gradeLabel(pct: number) {
  if (pct >= 85) return { label: 'Excellent', color: 'text-success' }
  if (pct >= 70) return { label: 'Good', color: 'text-blue-500' }
  if (pct >= 50) return { label: 'Average', color: 'text-warning' }
  return { label: 'Needs Work', color: 'text-danger' }
}

export function TestResults({ questions, userAnswers, score, maxScore, timeTaken, subjectBreakdown, onRetake }: TestResultsProps) {
  const [showReview, setShowReview] = useState(false)
  const [openQ, setOpenQ] = useState<number | null>(null)

  const pct = Math.round((score / maxScore) * 100)
  const grade = gradeLabel(pct)

  const subjectEntries = Object.entries(subjectBreakdown)
  const strongest = subjectEntries.sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))[0]
  const weakest = [...subjectEntries].sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* SCORE CARD */}
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 text-white text-center mb-8">
          <p className="text-blue-200 text-sm mb-2">Your Score</p>
          <div className="text-6xl font-bold mb-2">{score}<span className="text-3xl text-blue-300">/{maxScore}</span></div>
          <div className={`text-2xl font-bold mb-1 ${grade.color}`}>{pct}%</div>
          <div className={`text-lg font-medium ${grade.color}`}>{grade.label}</div>
          <p className="text-blue-300 text-sm mt-3">Time taken: {formatTime(timeTaken)}</p>
        </div>

        {/* SUBJECT BREAKDOWN */}
        {subjectEntries.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-bold text-text-primary mb-4">Subject Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(subjectBreakdown).map(([subject, { correct, total }]) => {
                const subPct = Math.round((correct / total) * 100)
                const barColor = subPct >= 70 ? 'bg-success' : subPct >= 50 ? 'bg-warning' : 'bg-danger'
                return (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-primary font-medium">{subject}</span>
                      <span className="text-text-secondary">{correct}/{total} ({subPct}%)</span>
                    </div>
                    <div className="h-2 bg-border rounded-full">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${subPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERFORMANCE INSIGHTS */}
        {subjectEntries.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-bold text-text-primary mb-4">Performance Insights</h3>
            <div className="space-y-2 text-sm">
              {strongest && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Strongest subject: {strongest[0]} ({Math.round((strongest[1].correct / strongest[1].total) * 100)}%)
                </div>
              )}
              {weakest && weakest[0] !== strongest?.[0] && (
                <div className="flex items-center gap-2 text-danger">
                  <XCircle className="w-4 h-4 shrink-0" />
                  Weakest subject: {weakest[0]} ({Math.round((weakest[1].correct / weakest[1].total) * 100)}%)
                </div>
              )}
              {weakest && weakest[0] !== strongest?.[0] && (
                <p className="text-text-secondary pt-1">Recommended: Practice more {weakest[0]}</p>
              )}
            </div>
          </div>
        )}

        {/* QUESTION REVIEW */}
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <button
            onClick={() => setShowReview(r => !r)}
            className="w-full flex items-center justify-between font-bold text-text-primary"
          >
            Review All Questions
            {showReview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {showReview && (
            <div className="mt-4 space-y-4">
              {questions.map((q, i) => {
                const userAns = userAnswers[q.id]
                const correct = userAns === q.correct_answer
                const options: Record<string, string> = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }

                return (
                  <div key={q.id} className={`border rounded-xl overflow-hidden ${correct ? 'border-green-200' : 'border-red-200'}`}>
                    <button
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm ${correct ? 'bg-green-50' : 'bg-red-50'}`}
                      onClick={() => setOpenQ(openQ === i ? null : i)}
                    >
                      {correct
                        ? <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      }
                      <span className="text-text-primary font-medium flex-1">{i + 1}. {q.question_text}</span>
                      {openQ === i ? <ChevronDown className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />}
                    </button>

                    {openQ === i && (
                      <div className="px-4 py-3 space-y-2 text-sm bg-white">
                        {!correct && userAns && (
                          <p className="text-danger">Your answer: <span className="font-medium">{userAns.toUpperCase()}. {options[userAns]}</span></p>
                        )}
                        {!userAns && <p className="text-text-muted">Not answered</p>}
                        <p className="text-success">Correct: <span className="font-medium">{q.correct_answer.toUpperCase()}. {options[q.correct_answer]}</span></p>
                        {q.explanation && (
                          <p className="text-text-secondary pt-1 border-t border-border mt-2">{q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRetake}
            className="flex-1 min-w-[140px] text-center py-3 px-5 bg-accent text-primary font-bold rounded-full hover:bg-accent-dark transition text-sm"
          >
            Take Another Test →
          </button>
          <Link
            href="/cet/practice"
            className="flex-1 min-w-[140px] text-center py-3 px-5 border border-border text-text-primary font-medium rounded-full hover:bg-surface transition text-sm"
          >
            Practice Weak Subjects →
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 min-w-[140px] text-center py-3 px-5 border border-border text-text-secondary font-medium rounded-full hover:bg-surface transition text-sm"
          >
            View Progress →
          </Link>
        </div>
      </div>
    </div>
  )
}
