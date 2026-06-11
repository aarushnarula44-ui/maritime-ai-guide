'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

type Qualification = 'class_10' | 'class_12' | 'diploma' | 'engineering_grad'
type Priority = 'fastest' | 'highest_salary' | 'lowest_cost' | 'work_life_balance'
type Department = 'deck' | 'engine' | 'eto'

const QUALIFICATIONS: { value: Qualification; label: string; sub: string }[] = [
  { value: 'class_10', label: 'Class 10', sub: 'Appeared or completed' },
  { value: 'class_12', label: 'Class 12', sub: 'PCM / any stream' },
  { value: 'diploma', label: 'Diploma', sub: 'Any technical diploma' },
  { value: 'engineering_grad', label: 'Graduate', sub: 'B.E / B.Tech / B.Sc' },
]

const PRIORITIES: { value: Priority; label: string; icon: string }[] = [
  { value: 'fastest', label: 'Fastest path to sea', icon: '🚀' },
  { value: 'highest_salary', label: 'Highest earning potential', icon: '💰' },
  { value: 'lowest_cost', label: 'Lowest total investment', icon: '💸' },
  { value: 'work_life_balance', label: 'Best work-life balance', icon: '⚖️' },
]

const DEPARTMENTS: { value: Department; label: string; icon: string }[] = [
  { value: 'deck', label: 'Deck', icon: '⚓' },
  { value: 'engine', label: 'Engine', icon: '⚙️' },
  { value: 'eto', label: 'ETO / Ratings', icon: '⚡' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [qualification, setQualification] = useState<Qualification | null>(null)
  const [pcm, setPcm] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(false)

  async function finish() {
    setLoading(true)
    // Save academic profile
    if (qualification) {
      await fetch('/api/user/academic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qualification,
          pcm_percentage: pcm ? parseFloat(pcm) : null,
        }),
      })
    }
    // Save profile fields
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_of_birth: dob || null,
        gender: gender || null,
        category: category || null,
        onboarding_completed: true,
      }),
    })
    // Save preferences
    if (priority || department) {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority, target_department: department }),
      }).catch(() => {})
    }
    setLoading(false)
    router.push('/dashboard?onboarded=1')
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-16 bg-accent' : s < step ? 'w-8 bg-accent/40' : 'w-8 bg-border'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-display text-2xl font-bold text-primary mb-2">Welcome to Maritime AI Guide!</h1>
          <p className="text-text-secondary mb-6">Let us set up your profile in 2 minutes so we can personalize your experience.</p>
          <div className="text-left space-y-3 mb-8 bg-surface rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-text-secondary"><span>✅</span><span>Get matched with eligible courses instantly</span></div>
            <div className="flex items-center gap-3 text-sm text-text-secondary"><span>📅</span><span>Track CET dates and set reminders</span></div>
            <div className="flex items-center gap-3 text-sm text-text-secondary"><span>🤖</span><span>Chat with NavAI for personalized advice</span></div>
          </div>
          <Button size="lg" onClick={() => setStep(2)}>Get Started →</Button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-xl font-bold text-primary mb-1">Your Background</h2>
          <p className="text-text-secondary text-sm mb-6">This helps us show your eligibility instantly.</p>

          <div className="mb-6">
            <p className="text-sm font-medium text-text-primary mb-3">Current Qualification</p>
            <div className="grid grid-cols-2 gap-3">
              {QUALIFICATIONS.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQualification(q.value)}
                  className={`border rounded-xl p-4 text-left transition ${qualification === q.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                >
                  <p className="font-semibold text-sm text-text-primary">{q.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{q.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {(qualification === 'class_12' || qualification === 'diploma' || qualification === 'engineering_grad') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-1">PCM / Overall Percentage</label>
              <input
                type="number"
                value={pcm}
                onChange={(e) => setPcm(e.target.value)}
                placeholder="e.g. 75.5"
                className="border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">— Select —</option>
                <option value="general">General</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="obc_ncl">OBC-NCL</option>
                <option value="ews">EWS</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs text-text-muted mb-1">Gender</label>
            <div className="flex gap-2">
              {['male', 'female', 'other'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 border rounded-lg py-2 text-sm capitalize transition ${gender === g ? 'border-accent bg-accent/5 text-accent font-semibold' : 'border-border text-text-secondary hover:border-accent/50'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} fullWidth disabled={!qualification}>Next →</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-xl font-bold text-primary mb-1">Your Goal</h2>
          <p className="text-text-secondary text-sm mb-6">Tell us your priorities so we can personalize recommendations.</p>

          <p className="text-sm font-medium text-text-primary mb-3">What matters most to you?</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`border rounded-xl p-4 text-left transition ${priority === p.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
              >
                <span className="text-2xl mb-2 block">{p.icon}</span>
                <p className="text-sm font-medium text-text-primary">{p.label}</p>
              </button>
            ))}
          </div>

          <p className="text-sm font-medium text-text-primary mb-3">Which department interests you?</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDepartment(d.value)}
                className={`border rounded-xl p-4 text-center transition ${department === d.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
              >
                <span className="text-2xl mb-1 block">{d.icon}</span>
                <p className="text-sm font-medium text-text-primary">{d.label}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button loading={loading} onClick={finish} fullWidth>Finish Setup →</Button>
          </div>
        </div>
      )}
    </div>
  )
}
