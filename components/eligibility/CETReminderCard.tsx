'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  registrationDate?: string
}

export function CETReminderCard({ registrationDate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input) return
    setLoading(true)
    const isEmail = input.includes('@')
    await fetch('/api/reminders/cet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEmail ? { email: input } : { phone: input }),
    })
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="font-semibold text-primary text-sm mb-1">
        📅 CET Registration{registrationDate ? ` opens ${registrationDate}` : ' coming soon'}
      </p>
      <p className="text-text-secondary text-xs mb-3">
        Get a reminder — we will SMS/email you 7 days before registration opens.
      </p>
      {done ? (
        <p className="text-success text-sm font-medium">
          ✓ Reminder set{registrationDate ? ` for ${registrationDate}` : ''}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Email or phone number"
            className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" size="sm" loading={loading}>
            Set Reminder
          </Button>
        </form>
      )}
    </div>
  )
}
