'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function NavAIWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m NavAI, your maritime career advisor. I\'m coming soon with full AI capabilities. For now, explore our eligibility checker and course guides!' }
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: 'NavAI is coming soon! In the meantime, check out our Eligibility Checker or browse the 8 official DGS-approved maritime courses.' }
    ])
    setInput('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-floating hover:bg-primary-light transition animate-pulse-slow"
        aria-label="Open NavAI"
      >
        <Sparkles className="w-6 h-6 text-accent" />
      </button>

      {open && (
        <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 h-[520px] bg-white rounded-2xl shadow-modal flex flex-col animate-slide-up border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <p className="font-display font-semibold text-white text-sm">NavAI</p>
                <p className="text-blue-300 text-xs">Maritime Career Advisor</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-300 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent text-primary font-medium rounded-br-sm'
                      : 'bg-surface text-text-primary rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me about maritime careers..."
                className="flex-1 text-sm border border-border rounded-full px-4 py-2 focus:outline-none focus:border-accent transition"
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary hover:bg-accent-dark transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
