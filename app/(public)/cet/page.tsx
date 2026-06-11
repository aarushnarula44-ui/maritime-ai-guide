import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CETTabs } from '@/components/cet/CETTabs'
import { Shield } from 'lucide-react'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'IMU CET 2025 — Complete Guide, Syllabus, Pattern | Maritime AI Guide',
  description: 'Complete IMU CET guide. Exam pattern, syllabus, 36 exam cities, registration process, preparation tips and free practice tests.',
}

type CETSchedule = {
  id: string; year: number; status: string
  exam_date: string | null; registration_start: string | null
  registration_end: string | null; result_date: string | null
}

async function getCETSchedule(): Promise<CETSchedule | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('cet_schedules')
      .select('*')
      .order('year', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data as CETSchedule | null
  } catch {
    return null
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function CETPage() {
  const schedule = await getCETSchedule()

  return (
    <div className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444]" style={{ minHeight: 240 }}>
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-blue-300" />
            <span className="text-xs text-blue-300 border border-white/20 rounded-full px-3 py-1">
              Based on DGS Training Circular No. 12 of 2020
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">IMU-CET Complete Guide</h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Everything you need to know about the Indian Maritime University Common Entrance Test
          </p>
        </div>
      </section>

      {/* CET STATUS BANNER */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {schedule?.status === 'upcoming' && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-amber-800 font-medium">
              📅 CET Registration opens {formatDate(schedule.registration_start)}
            </p>
            <Link href="/eligibility" className="text-sm font-bold text-amber-900 border border-amber-400 rounded-full px-4 py-1.5 hover:bg-amber-100 transition whitespace-nowrap">
              Set a Reminder →
            </Link>
          </div>
        )}
        {schedule?.status === 'registration_open' && (
          <div className="bg-green-50 border border-green-300 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-green-800 font-medium">✅ Registration is OPEN now!</p>
            <a
              href="https://www.imu.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-green-900 border border-green-400 rounded-full px-4 py-1.5 hover:bg-green-100 transition whitespace-nowrap"
            >
              Register at IMU Website →
            </a>
          </div>
        )}
        {(schedule?.status === 'ongoing' || schedule?.status === 'completed') && (
          <div className="bg-blue-50 border border-blue-300 rounded-xl px-5 py-4">
            <p className="text-blue-800 font-medium">
              Results expected {formatDate(schedule.result_date)}
            </p>
          </div>
        )}
        {!schedule && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-text-secondary font-medium">CET dates for 2025–26 not yet announced</p>
          </div>
        )}
      </div>

      {/* QUICK STATS BAR */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-white border border-border rounded-xl px-4 py-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Questions', value: '200' },
            { label: 'Total Marks', value: '200' },
            { label: 'Duration', value: '3 Hours' },
            { label: 'Fee', value: '₹1,000' },
            { label: 'Exam Cities', value: '36' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-4 mt-8 pb-16">
        <CETTabs />
      </div>
    </div>
  )
}
