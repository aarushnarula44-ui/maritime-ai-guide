'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { formatDistanceToNow } from 'date-fns'

interface DeferredData {
  cetPerformance: {
    mathematics_avg: number | null
    physics_avg: number | null
    chemistry_avg: number | null
    english_avg: number | null
    aptitude_avg: number | null
    overall_avg: number | null
    tests_taken: number
    best_score: number | null
  } | null
  recentTests: Array<{ id: string; test_type: string; score: number | null; max_score: number | null; time_taken_seconds: number | null; created_at: string }>
  recentNotifications: Array<{ id: string; type: string; title: string; body: string | null; is_read: boolean; created_at: string }>
  savedCourses: Array<{ id: string; course_id: string; courses: { id: string; name: string; department: string; duration_display: string } | null }>
  savedColleges: Array<{ id: string; college_id: string; colleges: { id: string; name: string; city: string | null; state: string | null; dgs_approval_status: string } | null }>
}

const TYPE_ICONS: Record<string, string> = {
  cet_reminder: '📝',
  sponsorship_open: '🚢',
  system: 'ℹ️',
  fraud_alert: '⚠️',
  eligibility_update: '✅',
}

const DEPT_COLORS: Record<string, string> = {
  deck: 'bg-blue-100 text-blue-700',
  engine: 'bg-orange-100 text-orange-700',
  eto: 'bg-purple-100 text-purple-700',
  ratings: 'bg-green-100 text-green-700',
  catering: 'bg-pink-100 text-pink-700',
}

const DGS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  flagged: 'bg-red-100 text-red-700',
  not_listed: 'bg-gray-100 text-gray-700',
}

function SubjectBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null
  const color = value >= 70 ? 'bg-success' : value >= 50 ? 'bg-warning' : 'bg-danger'
  const textColor = value >= 70 ? 'text-success' : value >= 50 ? 'text-warning' : 'text-danger'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className={`text-xs font-semibold ${textColor}`}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function LearningProgress({ data }: { data: DeferredData | null }) {
  if (!data) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
    )
  }
  const perf = data.cetPerformance
  if (!perf || perf.tests_taken === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-secondary text-sm mb-3">Start a practice test to see your progress</p>
        <Link href="/cet/practice" className="inline-block bg-accent text-primary font-semibold text-sm px-4 py-2 rounded-lg hover:bg-accent-dark transition">
          Take Mock Test →
        </Link>
      </div>
    )
  }

  const subjects = [
    { label: 'Mathematics', value: perf.mathematics_avg },
    { label: 'Physics', value: perf.physics_avg },
    { label: 'Chemistry', value: perf.chemistry_avg },
    { label: 'English', value: perf.english_avg },
    { label: 'General Aptitude', value: perf.aptitude_avg },
  ]

  const withValues = subjects.filter((s) => s.value != null) as { label: string; value: number }[]
  const weakest = withValues.length > 0 ? withValues.reduce((a, b) => (a.value < b.value ? a : b)) : null

  return (
    <div className="space-y-3">
      {subjects.map((s) => <SubjectBar key={s.label} label={s.label} value={s.value} />)}
      {weakest && weakest.value < 70 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">📚 Focus on {weakest.label} — your weakest subject</p>
          <Link href="/cet/practice" className="text-xs text-accent font-semibold hover:underline whitespace-nowrap ml-2">
            Practice →
          </Link>
        </div>
      )}
    </div>
  )
}

function NavAIQuickChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const SUGGESTIONS = ['Am I eligible for B.Sc.?', 'What is IMU CET?', 'Highest paying maritime job?']

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(part.slice(6))
            if (parsed.type === 'chunk') fullContent += parsed.content
          } catch { /* ignore malformed chunks */ }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent || 'No response received.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-48">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-surface border border-border text-text-secondary rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`text-sm rounded-lg p-2.5 ${m.role === 'user' ? 'bg-primary text-white ml-8' : 'bg-surface text-text-primary mr-8'}`}>
              {m.content}
            </div>
          ))
        )}
        {loading && <div className="bg-surface text-text-muted text-sm rounded-lg p-2.5 mr-8 animate-pulse">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-accent text-primary px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
        >
          →
        </button>
      </form>
      {messages.length > 0 && (
        <Link href="/advisor" className="text-xs text-accent hover:underline mt-2 text-center block">
          Open in full chat →
        </Link>
      )}
    </div>
  )
}

function SavedCourses({ data }: { data: DeferredData | null }) {
  if (!data) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-48 h-32 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }
  if (data.savedCourses.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-muted text-sm mb-2">No saved courses yet</p>
        <Link href="/courses" className="text-accent text-sm font-semibold hover:underline">Explore Courses →</Link>
      </div>
    )
  }
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {data.savedCourses.map((sc) => {
        const course = sc.courses
        if (!course) return null
        const deptColor = DEPT_COLORS[course.department] ?? 'bg-gray-100 text-gray-700'
        return (
          <Link key={sc.id} href={`/courses/${sc.course_id}`} className="flex-shrink-0 w-48 border border-border rounded-xl overflow-hidden hover:shadow-card-hover transition">
            <div className={`h-1.5 w-full ${deptColor.split(' ')[0]}`} />
            <div className="p-3">
              <p className="font-semibold text-sm text-text-primary line-clamp-2 mb-2">{course.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deptColor}`}>{course.department}</span>
              <p className="text-xs text-text-muted mt-1">{course.duration_display}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function SavedColleges({ data }: { data: DeferredData | null }) {
  if (!data) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-48 h-32 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }
  if (data.savedColleges.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-muted text-sm mb-2">No saved colleges yet</p>
        <Link href="/colleges" className="text-accent text-sm font-semibold hover:underline">Find Colleges →</Link>
      </div>
    )
  }
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {data.savedColleges.map((sc) => {
        const college = sc.colleges
        if (!college) return null
        const dgColor = DGS_COLORS[college.dgs_approval_status] ?? 'bg-gray-100 text-gray-700'
        return (
          <Link key={sc.id} href={`/colleges/${sc.college_id}`} className="flex-shrink-0 w-48 border border-border rounded-xl p-3 hover:shadow-card-hover transition">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dgColor}`}>
              DGS {college.dgs_approval_status}
            </span>
            <p className="font-semibold text-sm text-text-primary mt-2 line-clamp-2">{college.name}</p>
            <p className="text-xs text-text-muted mt-1">{[college.city, college.state].filter(Boolean).join(', ')}</p>
          </Link>
        )
      })}
    </div>
  )
}

function NotificationsCard({ data, unreadCount }: { data: DeferredData | null; unreadCount: number }) {
  const [localUnread, setLocalUnread] = useState(unreadCount)

  async function markAllRead() {
    setLocalUnread(0)
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
  }

  if (!data) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
  }

  if (data.recentNotifications.length === 0) {
    return <p className="text-sm text-text-muted">No notifications yet. We will alert you about CET dates and sponsorship openings.</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-sm">Notifications</span>
          {localUnread > 0 && (
            <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{localUnread}</span>
          )}
        </div>
        {localUnread > 0 && (
          <button onClick={markAllRead} className="text-xs text-accent hover:underline">Mark all read</button>
        )}
      </div>
      <div className="space-y-2">
        {data.recentNotifications.map((n) => (
          <div key={n.id} className={`flex gap-3 p-2.5 rounded-lg ${!n.is_read ? 'bg-blue-50' : ''}`}>
            <span className="text-lg">{TYPE_ICONS[n.type] ?? 'ℹ️'}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.is_read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{n.title}</p>
              {n.body && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{n.body}</p>}
              <p className="text-[11px] text-text-muted mt-0.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardClient({ unreadNotifications }: { unreadNotifications: number }) {
  const [data, setData] = useState<DeferredData | null>(null)

  useEffect(() => {
    fetch('/api/user/dashboard?type=deferred')
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => {})
  }, [])

  const QUICK_ACTIONS = [
    { label: 'Check Eligibility', icon: '✅', href: '/eligibility' },
    { label: 'Find Colleges', icon: '🏫', href: '/colleges' },
    { label: 'CET Practice', icon: '📝', href: '/cet/practice' },
    { label: 'Salary Explorer', icon: '💰', href: '/salaries' },
    { label: 'Sponsorships', icon: '🚢', href: '/sponsorships' },
    { label: 'Career Roadmap', icon: '🗺️', href: '/roadmap' },
  ]

  return (
    <div className="grid grid-cols-12 gap-6 px-4 md:px-8 py-8">
      {/* Card 3: Learning Progress */}
      <div className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-text-primary">CET Preparation Progress</h2>
            <p className="text-xs text-text-muted mt-0.5">Based on your practice test performance</p>
          </div>
          <Link href="/cet/practice" className="text-sm text-accent hover:underline font-medium">Practice →</Link>
        </div>
        <LearningProgress data={data} />
      </div>

      {/* Card 4: NavAI Quick Chat */}
      <div className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">✨</span>
            <h2 className="font-semibold text-text-primary">Ask NavAI</h2>
          </div>
          <Link href="/advisor" className="text-sm text-accent hover:underline font-medium">Full Chat →</Link>
        </div>
        <NavAIQuickChat />
      </div>

      {/* Card 5: Saved Courses */}
      <div className="col-span-12 bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-text-primary">Saved Courses</h2>
            {data && <span className="bg-surface text-text-muted text-xs px-2 py-0.5 rounded-full">{data.savedCourses.length}</span>}
          </div>
          <Link href="/courses" className="text-sm text-accent hover:underline font-medium">View All →</Link>
        </div>
        <SavedCourses data={data} />
      </div>

      {/* Card 6: Saved Colleges */}
      <div className="col-span-12 bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-text-primary">Saved Colleges</h2>
            {data && <span className="bg-surface text-text-muted text-xs px-2 py-0.5 rounded-full">{data.savedColleges.length}</span>}
          </div>
          <Link href="/colleges" className="text-sm text-accent hover:underline font-medium">View All →</Link>
        </div>
        <SavedColleges data={data} />
      </div>

      {/* Card 7: Notifications */}
      <div className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-card p-6">
        <NotificationsCard data={data} unreadCount={unreadNotifications} />
      </div>

      {/* Card 8: Quick Actions */}
      <div className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-card p-6">
        <h2 className="font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1 border border-border rounded-xl p-3 text-center hover:border-accent hover:text-accent transition group"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-text-secondary group-hover:text-accent">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
