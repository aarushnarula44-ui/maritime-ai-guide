'use client'

import { useState, useEffect } from 'react'
import { MockTestEngine, type Question } from '@/components/cet/MockTestEngine'
import { BookOpen, Target, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
export const dynamic = 'force-dynamic'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'General Aptitude']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed']
const COUNTS = [10, 20, 30, 50]
const TOPICS: Record<string, string[]> = {
  Mathematics: ['Algebra', 'Trigonometry', 'Calculus', 'Statistics', 'Coordinate Geometry', 'Matrices and Determinants', 'Vectors and 3D Geometry', 'Probability'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity and Magnetism', 'Modern Physics', 'Waves and Oscillations', 'Units and Measurements'],
  Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Electrochemistry', 'Chemical Equilibrium', 'Atomic Structure'],
  English: ['Grammar and Usage', 'Reading Comprehension', 'Vocabulary', 'Sentence Correction', 'Para Jumbles', 'Fill in the Blanks'],
  'General Aptitude': ['Logical Reasoning', 'Numerical Ability', 'Spatial Reasoning', 'Data Interpretation', 'General Knowledge (Maritime focused)'],
}

interface Stats {
  testsTaken: number
  avgScore: number | null
  bestScore: number | null
}

export default function CETPracticePage() {
  const [stats, setStats] = useState<Stats>({ testsTaken: 0, avgScore: null, bestScore: null })
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [difficulty, setDifficulty] = useState('Mixed')
  const [count, setCount] = useState(10)
  const [topic, setTopic] = useState('')
  const [mode, setMode] = useState<'select' | 'test'>('select')
  const [questions, setQuestions] = useState<Question[]>([])
  const [testType, setTestType] = useState<'full_mock' | 'subject_wise' | 'topic_wise'>('subject_wise')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      type PerfRow = { tests_taken: number; overall_avg: number | null; best_score: number | null }
      const { data } = await supabase
        .from('user_cet_performance')
        .select('tests_taken, overall_avg, best_score')
        .eq('user_id', user.id)
        .maybeSingle()
      const perf = data as PerfRow | null
      if (perf) setStats({ testsTaken: perf.tests_taken, avgScore: perf.overall_avg, bestScore: perf.best_score })
    }
    fetchStats()
  }, [])

  const startTest = async (type: 'full_mock' | 'subject_wise' | 'topic_wise', params: URLSearchParams) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cet/questions?${params}`)
      if (!res.ok) throw new Error('Failed to load questions')
      const data = await res.json()
      if (!data.questions || data.questions.length === 0) throw new Error('No questions available yet. Please check back soon.')
      setQuestions(data.questions)
      setTestType(type)
      setMode('test')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  if (mode === 'test') {
    const totalSeconds = testType === 'full_mock' ? 10800 : count * 60
    return (
      <MockTestEngine
        questions={questions}
        testType={testType}
        subjectFilter={testType !== 'full_mock' ? subject : undefined}
        totalSeconds={totalSeconds}
        onExit={() => setMode('select')}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">CET Practice Tests</h1>
          <p className="text-text-secondary mt-1">Prepare for IMU-CET with subject-wise and full mock tests</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-text-primary text-xl">{stats.testsTaken}</div>
            <div className="text-text-muted">Tests taken</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-text-primary text-xl">{stats.avgScore != null ? `${Math.round(stats.avgScore)}%` : '—'}</div>
            <div className="text-text-muted">Average score</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-text-primary text-xl">{stats.bestScore != null ? `${Math.round(stats.bestScore)}%` : '—'}</div>
            <div className="text-text-muted">Best score</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* FULL MOCK */}
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-bold text-text-primary mb-1">Full Mock Test</h2>
          <p className="text-text-secondary text-sm mb-4 flex-1">200 questions · 3 hours · All subjects</p>
          <div className="flex gap-3 text-xs text-text-muted mb-5 flex-wrap">
            <span>50 Math</span><span>50 Physics</span><span>20 Chemistry</span><span>40 English</span><span>40 Aptitude</span>
          </div>
          <button
            onClick={() => startTest('full_mock', new URLSearchParams({ type: 'mock', count: '200' }))}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light transition text-sm disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Start Full Mock →'}
          </button>
        </div>

        {/* SUBJECT-WISE */}
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-accent-dark" />
          </div>
          <h2 className="font-bold text-text-primary mb-4">Subject-wise Practice</h2>

          <div className="space-y-3 flex-1">
            <div>
              <p className="text-xs text-text-muted mb-2">Subject</p>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => setSubject(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${subject === s ? 'bg-accent text-primary border-accent font-bold' : 'border-border text-text-secondary hover:border-accent'}`}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Difficulty</p>
              <div className="flex gap-1.5 flex-wrap">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${difficulty === d ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Questions</p>
              <div className="flex gap-1.5">
                {COUNTS.map(c => (
                  <button key={c} onClick={() => setCount(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${count === c ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const p = new URLSearchParams({ subject, difficulty: difficulty.toLowerCase(), count: String(count), type: 'practice' })
              startTest('subject_wise', p)
            }}
            disabled={loading}
            className="w-full mt-5 bg-accent text-primary font-bold py-3 rounded-xl hover:bg-accent-dark transition text-sm disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Start Practice →'}
          </button>
        </div>

        {/* TOPIC-WISE */}
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-success" />
          </div>
          <h2 className="font-bold text-text-primary mb-4">Topic-wise Practice</h2>

          <div className="space-y-3 flex-1">
            <div>
              <p className="text-xs text-text-muted mb-2">Subject</p>
              <select
                value={subject}
                onChange={e => { setSubject(e.target.value); setTopic('') }}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Topic</p>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">Select a topic…</option>
                {TOPICS[subject]?.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <p className="text-xs text-text-muted">20 questions on selected topic</p>
          </div>

          <button
            onClick={() => {
              if (!topic) return setError('Please select a topic')
              const p = new URLSearchParams({ subject, topic, count: '20', type: 'practice' })
              startTest('topic_wise', p)
            }}
            disabled={loading || !topic}
            className="w-full mt-5 bg-success text-white font-bold py-3 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Start Topic Practice →'}
          </button>
        </div>
      </div>
    </div>
  )
}
