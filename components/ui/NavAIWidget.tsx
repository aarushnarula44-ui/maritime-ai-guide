'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Send, ExternalLink, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  isStreaming?: boolean
}

const PAGE_GREETINGS: Record<string, string> = {
  '/eligibility': 'I can explain any eligibility rule',
  '/colleges': 'I can check DGS status or compare colleges',
  '/courses': 'Ask me about any maritime course',
  '/salaries': 'Ask me about salary for any rank or vessel type',
}

const PAGE_CHIPS: Record<string, string[]> = {
  '/eligibility': ['What is the age limit?', 'PCM requirement?', 'Medical standards?'],
  '/colleges': ['Is this college DGS approved?', 'IMU vs private college?', 'Best colleges?'],
  '/courses': ['DNS vs B.Sc.?', 'Which course is faster?', 'Course fees?'],
  '/salaries': ['Captain salary?', 'Entry-level pay?', 'Salary growth path?'],
}

const DEFAULT_CHIPS = ['Am I eligible?', 'Course guide', 'IMU CET info']
const SESSION_KEY = 'navai_widget_messages'
const MAX_WIDGET_MESSAGES = 20

export default function NavAIWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const greeting = Object.entries(PAGE_GREETINGS).find(([path]) => pathname?.startsWith(path))?.[1]
    ?? 'Ask me anything about maritime careers'
  const chips = Object.entries(PAGE_CHIPS).find(([path]) => pathname?.startsWith(path))?.[1] ?? DEFAULT_CHIPS

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_WIDGET_MESSAGES)))
      } catch { /* ignore */ }
    }
  }, [messages])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const trimmed = messages.length >= MAX_WIDGET_MESSAGES ? messages.slice(-(MAX_WIDGET_MESSAGES - 2)) : messages
    setMessages([...trimmed, { role: 'user', content: msg }, { role: 'assistant', content: '', isStreaming: true, citations: [] }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId }),
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
                const u = [...prev]
                const last = u[u.length - 1]
                if (last?.role === 'assistant') last.content += event.content
                return u
              })
            } else if (event.type === 'citation') {
              setMessages((prev) => {
                const u = [...prev]
                const last = u[u.length - 1]
                if (last?.role === 'assistant') last.citations = [...(last.citations ?? []), event.source]
                return u
              })
            } else if (event.type === 'done' || event.type === 'error') {
              setMessages((prev) => {
                const u = [...prev]
                const last = u[u.length - 1]
                if (last?.role === 'assistant') {
                  last.isStreaming = false
                  if (event.type === 'error') last.content = event.message
                }
                return u
              })
            }
          } catch { /* malformed */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const u = [...prev]
        const last = u[u.length - 1]
        if (last?.role === 'assistant') { last.content = 'Something went wrong. Please try again.'; last.isStreaming = false }
        return u
      })
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, sessionId])

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-floating hover:bg-primary-light transition group ${open ? 'hidden' : ''}`}
        aria-label="Open NavAI"
      >
        <Sparkles className="w-6 h-6 text-accent animate-pulse-slow" />
        <span className="absolute right-16 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none hidden md:block">
          Ask NavAI
        </span>
      </button>

      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 h-full md:h-[520px] bg-white md:rounded-2xl shadow-modal flex flex-col animate-slide-up border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent animate-pulse-slow" />
              </div>
              <div>
                <p className="font-display font-semibold text-white text-sm">NavAI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  <p className="text-blue-300 text-xs">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/advisor" className="text-blue-300 hover:text-white transition" title="Open full chat">
                <ExternalLink className="w-4 h-4" />
              </a>
              <button onClick={() => setOpen(false)} className="text-blue-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Greeting */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-text-primary">
                {greeting} 👋
              </div>
            </div>

            {messages.length >= MAX_WIDGET_MESSAGES && (
              <p className="text-xs text-center text-text-muted">
                <a href="/advisor" className="text-accent hover:underline">Open full chat</a> for complete history
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent text-primary font-medium rounded-br-sm'
                      : 'bg-surface border border-border text-text-primary rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-0.5">
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
                    <p className="text-xs text-text-muted mt-0.5">📋 {msg.citations[0]}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-1.5 text-text-muted text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                NavAI is thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 pb-1 flex gap-2 overflow-x-auto flex-shrink-0">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="flex-shrink-0 text-xs bg-surface border border-border text-text-secondary hover:border-accent hover:text-primary px-3 py-1.5 rounded-full transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me about maritime careers..."
                className="flex-1 text-sm border border-border rounded-full px-4 py-2 focus:outline-none focus:border-accent transition"
                maxLength={500}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary hover:bg-accent-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted text-center mt-1.5">Powered by official DGS guidelines</p>
          </div>
        </div>
      )}
    </>
  )
}
