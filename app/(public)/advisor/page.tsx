'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Send, Plus, ExternalLink,
  ChevronRight, Loader2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  isStreaming?: boolean
}

interface SessionPreview {
  id: string
  first_message_preview: string
  updated_at: string
}

const STARTER_CARDS = [
  'Am I eligible for B.Sc. Nautical Science?',
  'Difference between DNS and B.Sc.?',
  'How much does a Captain earn?',
  'Best colleges for Marine Engineering?',
  'How to apply for sponsorship?',
  'What subjects for IMU CET?',
]

const QUICK_TOPICS = [
  { icon: '🎯', label: 'Eligibility Check', message: 'How do I check my eligibility for merchant navy courses?' },
  { icon: '📚', label: 'Course Guide', message: 'What maritime courses are available after Class 12?' },
  { icon: '🏫', label: 'Find Colleges', message: 'What are the DGS approved maritime colleges in India?' },
  { icon: '💰', label: 'Salary Info', message: 'What is the salary range for merchant navy officers?' },
  { icon: '📝', label: 'CET Prep', message: 'How do I prepare for IMU CET exam?' },
  { icon: '🚢', label: 'Life at Sea', message: 'What is the daily life like for a merchant navy officer?' },
  { icon: '👨‍👩‍👧', label: 'Parent Questions', message: 'Is merchant navy a safe and stable career for my child?' },
]

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionPreview[]>([])
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const router = useRouter()

  function handleMessagesScroll() {
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldAutoScrollRef.current = distanceFromBottom < 80
  }

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/ai/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions ?? [])
      }
    } catch {
      // anonymous — no sessions
    }
  }

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    shouldAutoScrollRef.current = true
    setInput('')
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true, citations: [] }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId, language }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk') {
              setMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last?.role !== 'assistant') return prev
                return [...prev.slice(0, -1), { ...last, content: last.content + event.content }]
              })
            } else if (event.type === 'citation') {
              setMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last?.role !== 'assistant') return prev
                return [...prev.slice(0, -1), { ...last, citations: [...(last.citations ?? []), event.source] }]
              })
            } else if (event.type === 'done') {
              setMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last?.role !== 'assistant') return prev
                return [...prev.slice(0, -1), { ...last, isStreaming: false }]
              })
            } else if (event.type === 'error') {
              setMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last?.role !== 'assistant') return prev
                return [...prev.slice(0, -1), { ...last, content: event.message, isStreaming: false }]
              })
            }
          } catch { /* malformed SSE */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role !== 'assistant') return prev
        return [...prev.slice(0, -1), { ...last, content: 'Something went wrong. Please try again.', isStreaming: false }]
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, sessionId, language])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function newConversation() {
    setMessages([])
    setSessionId(null)
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-surface">
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-border">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2 bg-accent text-primary font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-accent-dark transition"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Conversations</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-text-muted">No conversations yet</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSessionId(s.id); router.push(`/advisor?session=${s.id}`) }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface text-sm text-text-secondary hover:text-text-primary transition"
                >
                  <p className="truncate">{s.first_message_preview || 'Chat session'}</p>
                  <p className="text-xs text-text-muted">{new Date(s.updated_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Topics</p>
          <div className="space-y-1">
            {QUICK_TOPICS.map((t) => (
              <button
                key={t.label}
                onClick={() => sendMessage(t.message)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface text-sm text-text-secondary hover:text-text-primary transition"
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${language === 'en' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
            >EN</button>
            <button
              onClick={() => setLanguage('hi')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${language === 'hi' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
            >हिं</button>
          </div>
        </div>
      </aside>

      {/* CENTER */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent animate-pulse-slow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-primary leading-tight">NavAI</p>
            <p className="text-xs text-text-secondary">Maritime Career Advisor</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Online · Based on Official DGS Guidelines
          </div>
        </div>

        <div ref={scrollContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-6 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary mb-1">Hi! I am NavAI. 👋</h2>
              <p className="text-text-secondary mb-1">Ask me anything about the DGS maritime guidelines</p>
              <p className="text-text-secondary mb-8">Ask me anything about your maritime career.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                {STARTER_CARDS.map((card) => (
                  <button
                    key={card}
                    onClick={() => sendMessage(card)}
                    className="bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-primary hover:border-accent hover:shadow-card-hover transition text-left"
                  >
                    {card}
                    <ChevronRight className="w-3 h-3 inline ml-1 text-text-muted" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent text-primary font-medium rounded-br-sm'
                      : 'bg-white border border-border text-text-primary rounded-bl-sm shadow-card'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {msg.isStreaming && (
                          <span className="inline-flex gap-0.5 ml-1">
                            {[0, 1, 2].map((j) => (
                              <span key={j} className="w-1 h-1 rounded-full bg-text-muted animate-bounce"
                                style={{ animationDelay: `${j * 150}ms` }} />
                            ))}
                          </span>
                        )}
                      </div>
                    ) : msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                    <div className="mt-1 space-y-0.5">
                      {msg.citations.map((c, ci) => (
                        <p key={ci} className="text-xs text-text-muted">📋 Source: {c}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              NavAI is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border bg-white px-4 py-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your maritime career..."
              rows={1}
              className="flex-1 text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent transition resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary hover:bg-accent-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {input.length > 400 && (
            <p className="text-xs text-warning mt-1">{input.length}/500 characters</p>
          )}
          <p className="text-xs text-text-muted mt-2 text-center">
            NavAI is an AI and it can make mistakes. Please double check your responses with the official DGS guidelines.
          </p>
        </div>
      </div>

      {/* RIGHT CONTEXT PANEL */}
      <aside className="hidden xl:flex flex-col w-72 border-l border-border bg-white overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Context Panel</p>
        </div>
        <div className="flex-1 p-4">
          <ContextPanel messages={messages} />
        </div>
        <div className="p-4 border-t border-border">
          <a href="/advisor" className="flex items-center gap-2 text-xs text-accent hover:text-accent-dark font-medium transition">
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Chat
          </a>
        </div>
      </aside>
    </div>
  )
}

function ContextPanel({ messages }: { messages: ChatMessage[] }) {
  const allText = messages.map((m) => m.content).join(' ').toLowerCase()
  if (messages.length === 0) {
    return <p className="text-sm text-text-muted">Course and college information will appear here as we chat.</p>
  }

  const items: React.ReactNode[] = []

  if (allText.includes('cet') || allText.includes('imu')) {
    const cetDate = new Date('2025-04-01')
    const daysLeft = Math.max(0, Math.ceil((cetDate.getTime() - Date.now()) / 86400000))
    items.push(
      <div key="cet" className="bg-surface rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-text-secondary mb-1">IMU CET</p>
        <p className="text-lg font-bold text-primary">{daysLeft} days</p>
        <p className="text-xs text-text-muted">Until next CET exam</p>
        <a href="/cet" className="mt-2 text-xs text-accent hover:underline block">CET Preparation →</a>
      </div>,
    )
  }
  if (allText.includes('salary') || allText.includes('earn')) {
    items.push(
      <div key="salary" className="bg-surface rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-text-secondary mb-2">Salary Ranges</p>
        {[
          { rank: 'Captain', range: '$8,000–$12,000/mo' },
          { rank: 'Chief Officer', range: '$5,000–$8,000/mo' },
          { rank: 'Cadet', range: '$800–$1,200/mo' },
        ].map((r) => (
          <div key={r.rank} className="flex justify-between text-xs py-1 border-b border-border-light last:border-0">
            <span className="text-text-secondary">{r.rank}</span>
            <span className="font-medium text-primary">{r.range}</span>
          </div>
        ))}
      </div>,
    )
  }
  if (allText.includes('eligible') || allText.includes('qualify')) {
    items.push(
      <div key="elig" className="bg-surface rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-text-secondary mb-2">Eligibility Check</p>
        <p className="text-xs text-text-muted mb-2">Get a personalised eligibility report</p>
        <a href="/eligibility" className="text-xs bg-accent text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-accent-dark transition inline-block">
          Check My Eligibility →
        </a>
      </div>,
    )
  }
  if (allText.includes('college') || allText.includes('institute')) {
    items.push(
      <div key="colleges" className="bg-surface rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-text-secondary mb-2">College Search</p>
        <p className="text-xs text-text-muted mb-2">Find DGS-approved colleges near you</p>
        <a href="/colleges" className="text-xs text-accent hover:underline block">Browse colleges →</a>
      </div>,
    )
  }

  return items.length > 0 ? <>{items}</> : (
    <p className="text-sm text-text-muted">Course and college information will appear here as we chat.</p>
  )
}
