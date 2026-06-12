'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = (profile as { role: string } | null)?.role
      if (role !== 'super_admin') {
        router.push('/dashboard')
      } else {
        setAuthorized(true)
      }
    })
  }, [router])

  if (authorized === null) return <div className="text-slate-400 text-sm">Checking access…</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900">Settings</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Environment Configuration</h3>
        <p className="text-sm text-slate-500">
          Core settings are managed via environment variables. Update them in your hosting dashboard and redeploy.
        </p>
        <div className="space-y-2">
          {[
            ['OPENAI_DAILY_BUDGET_USD', 'Daily AI spend budget in USD'],
            ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
            ['OPENAI_API_KEY', 'OpenAI API key (keep secret)'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
              <code className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono mt-0.5">{key}</code>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Admin Access</h3>
        <p className="text-sm text-slate-500">
          To promote a user to super_admin, run the SQL in{' '}
          <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">supabase/make_admin.sql</code>{' '}
          in the Supabase SQL Editor.
        </p>
      </div>
    </div>
  )
}
