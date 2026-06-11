'use client'

import { useState } from 'react'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  score: number
  eligibleCount: number
  onUnlock: () => void
}

export default function EmailCaptureGate({ score, eligibleCount, onUnlock }: Props) {
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEmail = contact.includes('@')
  const isPhone = /^\d{10}$/.test(contact.replace(/\s/g, ''))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email or 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('leads').insert({
        email: isEmail ? contact : null,
        phone: isPhone ? contact : null,
        eligibility_score: score,
      })
    } catch {
      // Non-fatal if table doesn't exist yet
    } finally {
      setLoading(false)
      onUnlock()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-modal border border-border overflow-hidden mb-4">
      {/* Blurred preview */}
      <div className="relative">
        <div className="p-4 blur-sm select-none pointer-events-none">
          <div className="bg-white rounded-xl border-l-4 border-l-success border border-border p-4 mb-3">
            <div className="h-4 bg-border rounded w-24 mb-2" />
            <div className="h-5 bg-border rounded w-48 mb-2" />
            <div className="h-3 bg-border rounded w-full mb-1" />
            <div className="h-3 bg-border rounded w-3/4" />
          </div>
          <div className="bg-white rounded-xl border-l-4 border-l-success border border-border p-4">
            <div className="h-4 bg-border rounded w-20 mb-2" />
            <div className="h-5 bg-border rounded w-40 mb-2" />
            <div className="h-3 bg-border rounded w-full mb-1" />
            <div className="h-3 bg-border rounded w-2/3" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/90 via-white/70 to-transparent">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display font-bold text-primary text-lg mb-1">
              {eligibleCount - 2} more eligible courses
            </p>
            <p className="text-text-secondary text-sm">Enter your email to see your full report</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 border-t border-border">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Email address or phone number"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setError('') }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-primary font-bold py-3 rounded-xl hover:bg-accent-dark transition text-sm disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send my free report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-xs text-text-muted mt-3">
          Or{' '}
          <Link href="/signup" className="text-accent hover:underline">
            create a free account for more features →
          </Link>
        </p>
      </div>
    </div>
  )
}
