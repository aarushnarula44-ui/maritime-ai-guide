'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flag } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number | null
  created_at: string
}

interface SessionDetail {
  session: {
    id: string
    created_at: string
    user_id: string | null
    metadata: Record<string, unknown> | null
  }
  messages: Message[]
}

export default function AiSessionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/ai/sessions/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-slate-200 rounded" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    )
  }

  if (!data) return <p className="text-slate-500">Session not found.</p>

  const visibleMessages = data.messages.filter((m) => m.role !== 'system')

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/admin/ai/logs" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to Logs
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-400">Session ID</p>
            <p className="font-mono text-sm text-slate-800">{data.session.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Started</p>
            <p className="text-sm text-slate-800">{new Date(data.session.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">User</p>
            <p className="text-sm text-slate-800">{data.session.user_id ? data.session.user_id.slice(0, 12) + '…' : 'Anonymous'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Messages</p>
            <p className="text-sm text-slate-800">{visibleMessages.length}</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Conversation</h3>
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm relative group ${
                msg.role === 'user'
                  ? 'bg-[#0A1628] text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center gap-3 mt-2 opacity-60 text-xs">
                <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                {msg.tokens_used && <span>{msg.tokens_used} tokens</span>}
                <button
                  className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${
                    msg.role === 'user' ? 'text-red-300' : 'text-red-500'
                  }`}
                  title="Flag message"
                >
                  <Flag size={10} /> Flag
                </button>
              </div>
            </div>
          </div>
        ))}
        {visibleMessages.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">No messages in this session.</p>
        )}
      </div>
    </div>
  )
}
