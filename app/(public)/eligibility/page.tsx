'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  BookOpen, GraduationCap, Award, Building2, ArrowLeft, ArrowRight,
  CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Heart, Anchor
} from 'lucide-react'
import Link from 'next/link'
import {
  runEligibilityCheck, COURSE_RULES, type UserProfile, type EligibilityReport, type EligibilityResult,
} from '@/lib/eligibility/engine'
import EmailCaptureGate from '@/components/eligibility/EmailCaptureGate'

// ── Types ─────────────────────────────────────────────────────────────────────

type QualOption = 'class_10' | 'class_12' | 'diploma' | 'engineering_grad'

interface WizardState {
  qualification: QualOption | ''
  pcm: number
  physics: number
  chemistry: number
  maths: number
  english10: number
  english12: number
  diplomaPct: number
  diplomaMedium: boolean
  diplomaField: string
  degreePct: number
  degreeMedium: boolean
  degreeField: string
  day: string
  month: string
  year: string
  category: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | ''
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
  isIslandStNative: boolean
}

const INITIAL: WizardState = {
  qualification: '', pcm: 70, physics: 70, chemistry: 70, maths: 70,
  english10: 60, english12: 60, diplomaPct: 60, diplomaMedium: true, diplomaField: '',
  degreePct: 60, degreeMedium: true, degreeField: '', day: '', month: '', year: '',
  category: '', gender: '', isIslandStNative: false,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(a: number, b: number, c: number) {
  return Math.round((a + b + c) / 3)
}

function ageAt(dob: Date, at: Date) {
  return (at.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
}

function nextAug1(): Date {
  const now = new Date()
  const aug = new Date(now.getFullYear(), 7, 1)
  return now < aug ? aug : new Date(now.getFullYear() + 1, 7, 1)
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Highly Eligible'
  if (s >= 60) return 'Eligible'
  if (s >= 20) return 'Borderline'
  return 'Limited Options'
}

function deptBadge(dept: string) {
  const map: Record<string, string> = {
    deck: 'bg-blue-100 text-blue-700',
    engine: 'bg-green-100 text-green-700',
    eto: 'bg-purple-100 text-purple-700',
    ratings: 'bg-amber-100 text-amber-700',
    catering: 'bg-orange-100 text-orange-700',
  }
  return map[dept] ?? 'bg-gray-100 text-gray-700'
}

function courseSalary(courseId: string): { duration: string; start: string; peak: string } {
  const d: Record<string, { duration: string; start: string; peak: string }> = {
    'bsc-nautical-science': { duration: '3 Years', start: '₹1.2L/mo', peak: '₹12L/mo' },
    'dns-diploma-nautical-science': { duration: '1 Year', start: '₹1.2L/mo', peak: '₹12L/mo' },
    'be-btech-marine-engineering': { duration: '4 Years', start: '₹1.5L/mo', peak: '₹15L/mo' },
    'graduate-marine-engineering': { duration: '1 Year', start: '₹1.5L/mo', peak: '₹15L/mo' },
    'diploma-marine-engineering': { duration: '2 Years', start: '₹90K/mo', peak: '₹8L/mo' },
    'electro-technical-officer': { duration: '4 Months', start: '₹2L/mo', peak: '₹6L/mo' },
    'gp-rating': { duration: '6 Months', start: '₹45K/mo', peak: '₹1.5L/mo' },
    'maritime-catering-ccmc': { duration: '6 Months', start: '₹35K/mo', peak: '₹1L/mo' },
  }
  return d[courseId] ?? { duration: '—', start: '—', peak: '—' }
}

function courseDept(courseId: string) {
  return COURSE_RULES.find((c) => c.courseId === courseId)?.department ?? 'deck'
}

// ── Slider with number input ──────────────────────────────────────────────────

function SliderInput({ label, value, onChange, min = 0, max = 100 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number" min={min} max={max} value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            className="w-16 text-right border border-border rounded-md px-2 py-1 text-sm font-bold text-primary focus:outline-none focus:border-accent"
          />
          <span className="text-sm text-text-muted">%</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent h-2 cursor-pointer"
      />
    </div>
  )
}

// ── Course Result Card ────────────────────────────────────────────────────────

function CourseCard({ result, borderColor }: { result: EligibilityResult; borderColor: string }) {
  const { duration, start, peak } = courseSalary(result.courseId)
  const dept = courseDept(result.courseId)
  const icon = result.status === 'eligible' ? (
    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
  ) : (
    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
  )

  return (
    <div className={`bg-white rounded-xl border-l-4 ${borderColor} border border-border shadow-card p-4 mb-3`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptBadge(dept)}`}>
              {dept.toUpperCase()}
            </span>
          </div>
          <h3 className="font-display font-semibold text-primary">{result.courseName}</h3>
        </div>
        <button className="text-text-muted hover:text-danger transition p-1">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {result.status === 'eligible' && result.routeLabel && (
        <div className="flex items-center gap-1.5 mb-2">
          {icon}
          <span className="text-xs font-medium text-success">Eligible via {result.routeLabel}</span>
        </div>
      )}

      {result.status === 'eligible' && (
        <div className="space-y-1 mb-3">
          {result.reasons.filter((r) => !r.startsWith('Age') || r.includes('minimum')).slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {result.status === 'borderline' && result.gaps.length > 0 && (
        <div className="bg-warning/10 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-warning mb-1">What you need to qualify:</p>
          {result.gaps.map((g, i) => (
            <p key={i} className="text-xs text-text-secondary">{g.message}</p>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
        <span>⏱ {duration}</span>
        <span>💰 {start} starting</span>
        <span>🚀 {peak} peak</span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/courses/${result.courseSlug}`}
          className="flex-1 text-center text-xs font-semibold bg-primary text-white py-2 rounded-lg hover:bg-primary-light transition"
        >
          Learn More →
        </Link>
        {result.status === 'eligible' && (
          <Link
            href="/cet"
            className="text-xs font-medium text-accent border border-accent py-2 px-3 rounded-lg hover:bg-accent/10 transition"
          >
            📝 Prepare for CET
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

function EligibilityWizardInner() {
  const searchParams = useSearchParams()
  useRouter() // keep for future navigation
  const [step, setStep] = useState(1)
  const [w, setW] = useState<WizardState>(INITIAL)
  const [report, setReport] = useState<EligibilityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showNotEligible, setShowNotEligible] = useState(false)
  const [emailCaptured, setEmailCaptured] = useState(false)

  // Pre-fill from query params (landing page mini-wizard)
  useEffect(() => {
    const qual = searchParams.get('qual')
    const pcm = searchParams.get('pcm')
    const age = searchParams.get('age')
    if (qual || pcm || age) {
      setW((prev) => ({
        ...prev,
        qualification: (qual as QualOption) || prev.qualification,
        pcm: pcm ? Number(pcm) : prev.pcm,
        physics: pcm ? Number(pcm) : prev.physics,
        chemistry: pcm ? Number(pcm) : prev.chemistry,
        maths: pcm ? Number(pcm) : prev.maths,
        year: age ? String(new Date().getFullYear() - Number(age)) : prev.year,
      }))
      if (qual) setStep(2)
    }
  }, [searchParams])

  const totalSteps = w.category === 'st' ? 6 : 5

  function up(patch: Partial<WizardState>) {
    setW((prev) => ({ ...prev, ...patch }))
  }

  const computedPcm = avg(w.physics, w.chemistry, w.maths)

  // Sync computed PCM back into state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (w.qualification === 'class_12') {
      up({ pcm: computedPcm })
    }
  }, [w.physics, w.chemistry, w.maths, w.qualification, computedPcm])

  function canProceed(): boolean {
    if (step === 1) return w.qualification !== ''
    if (step === 2) {
      if (w.qualification === 'class_12') return w.physics > 0 && w.chemistry > 0 && w.maths > 0
      if (w.qualification === 'class_10') return w.diplomaPct > 0
      return true
    }
    if (step === 3) return w.day !== '' && w.month !== '' && w.year !== ''
    if (step === 4) return w.category !== ''
    if (step === 5) return w.gender !== ''
    return true
  }

  function buildProfile(): UserProfile {
    const dob = new Date(Number(w.year), Number(w.month) - 1, Number(w.day))
    return {
      qualification:
        w.qualification === 'class_10' ? 'class_10'
        : w.qualification === 'class_12' ? 'class_12'
        : w.qualification === 'diploma' ? 'diploma'
        : 'engineering_grad',
      dateOfBirth: dob,
      gender: w.gender || 'male',
      category: w.category || 'general',
      isIslandStNative: w.isIslandStNative,
      pcmAverage: w.pcm,
      physicsPercentage: w.physics,
      chemistryPercentage: w.chemistry,
      mathsPercentage: w.maths,
      englishPercentage10th: w.english10,
      englishPercentage12th: w.english12,
      diplomaPercentage: w.diplomaPct,
      diplomaMediumEnglish: w.diplomaMedium,
      degreePercentage: w.degreePct,
      degreeMediumEnglish: w.degreeMedium,
      degreeField: w.degreeField,
      state: '',
    }
  }

  const runCheck = useCallback(() => {
    setLoading(true)
    setProgress(0)
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 90))
    }, 150)
    setTimeout(() => {
      clearInterval(timer)
      setProgress(100)
      const profile = buildProfile()
      const result = runEligibilityCheck(profile, COURSE_RULES)
      setReport(result)
      setLoading(false)
    }, 1600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w])

  function next() {
    if (!canProceed()) return
    if (step === 5 && w.category !== 'st') {
      runCheck()
    } else if (step === totalSteps) {
      runCheck()
    } else {
      setStep((s) => s + 1)
    }
  }

  function back() {
    if (step > 1) setStep((s) => s - 1)
  }

  const courseStart = nextAug1()
  let ageAtStart: number | null = null
  let maxAge: number | null = null
  if (w.day && w.month && w.year) {
    const dob = new Date(Number(w.year), Number(w.month) - 1, Number(w.day))
    ageAtStart = ageAt(dob, courseStart)
    const catRelax = w.category === 'st' || w.category === 'sc' ? 5 : w.category === 'obc_ncl' ? 3 : 0
    const genderRelax = w.gender === 'female' ? 2 : 0
    maxAge = 25 + catRelax + genderRelax
  }

  const pcmColor = computedPcm >= 60 ? 'text-success' : computedPcm >= 55 ? 'text-warning' : 'text-danger'

  // ── Results view ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0D2444] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-modal max-w-lg w-full p-8 text-center">
          <div className="animate-wave inline-block mb-6">
            <svg viewBox="0 0 120 80" className="w-24 h-16 mx-auto" fill="none">
              <ellipse cx="60" cy="68" rx="55" ry="10" fill="#00D4FF" opacity="0.2"/>
              <path d="M15 55 L105 55 L98 65 L22 65 Z" fill="#1E3A5F"/>
              <rect x="35" y="38" width="50" height="20" rx="3" fill="#1E3A5F"/>
              <rect x="45" y="28" width="30" height="14" rx="2" fill="#243D6B"/>
              <rect x="57" y="18" width="14" height="12" rx="2" fill="#FF6B6B"/>
              <rect x="62" y="10" width="4" height="10" stroke="#94A3B8" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-primary mb-2">Checking your eligibility…</h2>
          <p className="text-text-secondary text-sm mb-6">Matching your profile against DGS guidelines</p>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (report) {
    const showGate = !emailCaptured && report.eligibleCourses.length + report.borderlineCourses.length > 2
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0D2444] py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Hero result card */}
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 mb-4 text-white shadow-modal border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Your Eligibility Report</p>
                <h1 className="font-display text-2xl font-bold leading-tight">
                  You qualify for{' '}
                  <span className="text-accent">{report.eligibleCourses.length} maritime course{report.eligibleCourses.length !== 1 ? 's' : ''}</span>
                </h1>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="font-display text-5xl font-bold text-accent leading-none">{report.eligibilityScore}</div>
                <div className="text-xs text-blue-300">/100 · {scoreLabel(report.eligibilityScore)}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="bg-white/10 text-blue-200 rounded-full px-3 py-1">
                ✓ {report.eligibleCourses.length} eligible
              </span>
              <span className="bg-white/10 text-blue-200 rounded-full px-3 py-1">
                ⚡ {report.borderlineCourses.length} borderline
              </span>
            </div>
          </div>

          {/* Eligible courses */}
          {report.eligibleCourses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <h2 className="font-display font-semibold text-white text-lg">Courses You Can Apply For Right Now</h2>
              </div>
              {(showGate ? report.eligibleCourses.slice(0, 2) : report.eligibleCourses).map((r) => (
                <CourseCard key={r.courseId} result={r} borderColor="border-l-success" />
              ))}
            </div>
          )}

          {/* Email gate */}
          {showGate && (
            <EmailCaptureGate
              score={report.eligibilityScore}
              eligibleCount={report.eligibleCourses.length}
              onUnlock={() => setEmailCaptured(true)}
            />
          )}

          {/* Borderline courses */}
          {!showGate && report.borderlineCourses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <h2 className="font-display font-semibold text-white text-lg">Courses You Are Close To</h2>
              </div>
              {report.borderlineCourses.map((r) => (
                <CourseCard key={r.courseId} result={r} borderColor="border-l-warning" />
              ))}
            </div>
          )}

          {/* Not eligible — collapsed */}
          {!showGate && report.notEligibleCourses.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowNotEligible((v) => !v)}
                className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition"
              >
                {showNotEligible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showNotEligible ? 'Hide' : 'Show'} courses you don&apos;t qualify for ({report.notEligibleCourses.length})
              </button>
              {showNotEligible && (
                <div className="mt-3">
                  {report.notEligibleCourses.map((r) => (
                    <div key={r.courseId} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-2">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-medium text-sm">{r.courseName}</p>
                          <p className="text-blue-300 text-xs mt-1">{r.reasons.find((s) => s.includes('below') || s.includes('exceeds') || s.includes('required'))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-white text-center">
            <p className="font-display font-semibold mb-1">Start Your Merchant Navy Journey</p>
            <p className="text-blue-200 text-sm mb-4">Create a free account to save results and get CET reminders</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="bg-accent text-primary font-bold py-3 px-6 rounded-full hover:bg-accent-dark transition text-sm">
                Create Free Account →
              </Link>
              <button
                onClick={() => setReport(null)}
                className="border border-white/30 text-white py-3 px-6 rounded-full hover:bg-white/10 transition text-sm"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Wizard ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0D2444] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-border">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${((step - 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
                <Anchor className="w-4 h-4" /> Home
              </Link>
            )}
            <span className="text-xs text-text-muted font-medium">Step {step} of {totalSteps}</span>
          </div>

          {/* STEP 1 — Qualification */}
          {step === 1 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">What is your current level of education?</h1>
              <p className="text-text-secondary text-sm mb-6">We will show you courses available for your qualification</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'class_10' as QualOption, icon: BookOpen, title: 'Class 10 Passed', sub: 'GP Rating, Catering courses' },
                  { value: 'class_12' as QualOption, icon: GraduationCap, title: 'Class 11 or 12 (PCM)', sub: 'Officer level courses' },
                  { value: 'diploma' as QualOption, icon: Award, title: 'Diploma Holder', sub: 'Engineering entry routes' },
                  { value: 'engineering_grad' as QualOption, icon: Building2, title: 'Engineering Graduate', sub: 'GME, ETO and more' },
                ].map((q) => {
                  const active = w.qualification === q.value
                  return (
                    <button
                      key={q.value}
                      onClick={() => { up({ qualification: q.value }); setStep(2) }}
                      className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                        active
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/40 hover:bg-surface'
                      }`}
                    >
                      {active && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-accent" />}
                      <q.icon className={`w-8 h-8 mb-2 ${active ? 'text-accent' : 'text-primary-light'}`} />
                      <p className={`font-semibold text-sm leading-tight mb-1 ${active ? 'text-accent' : 'text-primary'}`}>{q.title}</p>
                      <p className="text-xs text-text-muted leading-tight">{q.sub}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Marks */}
          {step === 2 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">
                {w.qualification === 'class_12' ? 'What are your Class 12 marks?' :
                 w.qualification === 'diploma' ? 'What are your Diploma marks?' :
                 w.qualification === 'engineering_grad' ? 'What are your Degree marks?' :
                 'What are your Class 10 marks?'}
              </h1>
              <p className="text-text-secondary text-sm mb-6">Enter your percentage in each subject</p>

              {w.qualification === 'class_12' && (
                <>
                  <SliderInput label="Physics %" value={w.physics} onChange={(v) => up({ physics: v })} />
                  <SliderInput label="Chemistry %" value={w.chemistry} onChange={(v) => up({ chemistry: v })} />
                  <SliderInput label="Mathematics %" value={w.maths} onChange={(v) => up({ maths: v })} />

                  <div className="bg-surface rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">PCM Average</p>
                      <p className="text-xs text-text-muted">Required: 60% for most officer courses</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-display text-3xl font-bold ${pcmColor}`}>{computedPcm}</span>
                      <span className={`text-sm ${pcmColor}`}>%</span>
                      {computedPcm >= 60 && <CheckCircle className="w-4 h-4 text-success ml-1 inline" />}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-text-secondary mb-3">English marks (Class 10 or 12 — whichever is higher)</p>
                    <SliderInput label="English % (Class 10)" value={w.english10} onChange={(v) => up({ english10: v })} />
                    <SliderInput label="English % (Class 12)" value={w.english12} onChange={(v) => up({ english12: v })} />
                  </div>
                </>
              )}

              {w.qualification === 'diploma' && (
                <>
                  <SliderInput label="Diploma Aggregate %" value={w.diplomaPct} onChange={(v) => up({ diplomaPct: v })} />
                  <SliderInput label="English % (Class 10)" value={w.english10} onChange={(v) => up({ english10: v })} />
                  <div className="mb-4">
                    <label className="text-sm font-medium text-text-secondary block mb-1">What was your diploma in?</label>
                    <input
                      type="text" placeholder="e.g. Mechanical Engineering"
                      value={w.diplomaField}
                      onChange={(e) => up({ diplomaField: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={w.diplomaMedium} onChange={(e) => up({ diplomaMedium: e.target.checked })}
                      className="w-4 h-4 accent-accent" />
                    <span className="text-sm text-text-secondary">Medium of instruction was English</span>
                  </label>
                </>
              )}

              {w.qualification === 'engineering_grad' && (
                <>
                  <SliderInput label="Degree Aggregate %" value={w.degreePct} onChange={(v) => up({ degreePct: v })} />
                  <SliderInput label="English % (Class 10)" value={w.english10} onChange={(v) => up({ english10: v })} />
                  <div className="mb-4">
                    <label className="text-sm font-medium text-text-secondary block mb-1">What is your degree in?</label>
                    <input
                      type="text" placeholder="e.g. Mechanical Engineering"
                      value={w.degreeField}
                      onChange={(e) => up({ degreeField: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={w.degreeMedium} onChange={(e) => up({ degreeMedium: e.target.checked })}
                      className="w-4 h-4 accent-accent" />
                    <span className="text-sm text-text-secondary">Medium of instruction was English</span>
                  </label>
                </>
              )}

              {w.qualification === 'class_10' && (
                <>
                  <SliderInput label="Class 10 Aggregate %" value={w.diplomaPct} onChange={(v) => up({ diplomaPct: v })} />
                  <SliderInput label="English % (Class 10)" value={w.english10} onChange={(v) => up({ english10: v })} />
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-text-secondary">Subjects studied in Class 10:</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-accent" defaultChecked />
                      <span className="text-sm text-text-secondary">Science</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-accent" defaultChecked />
                      <span className="text-sm text-text-secondary">Mathematics</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — DOB */}
          {step === 3 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">When were you born?</h1>
              <p className="text-text-secondary text-sm mb-6">
                Age is calculated on the course start date, not today
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Day', key: 'day' as const, placeholder: 'DD', max: 31 },
                  { label: 'Month', key: 'month' as const, placeholder: 'MM', max: 12 },
                  { label: 'Year', key: 'year' as const, placeholder: 'YYYY', max: 2015 },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                    <input
                      type="number" placeholder={f.placeholder} value={w[f.key]}
                      onChange={(e) => up({ [f.key]: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-3 text-center text-lg font-bold text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>

              {ageAtStart !== null && maxAge !== null && (
                <div className={`rounded-xl p-4 ${ageAtStart <= maxAge ? 'bg-success/10' : 'bg-danger/10'}`}>
                  <div className="flex items-start gap-2">
                    {ageAtStart <= maxAge
                      ? <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="font-semibold text-sm text-primary">
                        Your age at course start (Aug {courseStart.getFullYear()}): <span className={ageAtStart <= maxAge ? 'text-success' : 'text-danger'}>{ageAtStart.toFixed(1)} years</span>
                      </p>
                      <p className="text-text-secondary text-xs mt-0.5">
                        Maximum age for your profile: {maxAge} years
                        {ageAtStart > maxAge && ' — You may be over the age limit for most courses.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Category */}
          {step === 4 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">What is your reservation category?</h1>
              <p className="text-text-secondary text-sm mb-6">This affects the maximum age limit</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { value: 'general', label: 'General' },
                  { value: 'sc', label: 'SC' },
                  { value: 'st', label: 'ST' },
                  { value: 'obc_ncl', label: 'OBC (Non-Creamy Layer)' },
                  { value: 'ews', label: 'EWS' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => up({ category: c.value as WizardState['category'] })}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      w.category === c.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {w.category === 'obc_ncl' && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 mb-4">
                  ℹ️ Non-Creamy Layer means annual family income below ₹8 lakh
                </div>
              )}
              {w.category && ageAtStart !== null && (
                <div className="bg-surface rounded-xl p-4 text-sm text-text-secondary">
                  Your maximum age limit:{' '}
                  <strong className="text-primary">
                    {25 + (w.category === 'sc' || w.category === 'st' ? 5 : w.category === 'obc_ncl' ? 3 : 0) + (w.gender === 'female' ? 2 : 0)} years
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 5 — Gender */}
          {step === 5 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">What is your gender?</h1>
              <p className="text-text-secondary text-sm mb-6">Used to calculate age relaxation benefits</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ].map((g) => (
                  <button
                    key={g.value}
                    onClick={() => up({ gender: g.value as WizardState['gender'] })}
                    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition ${
                      w.gender === g.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {w.gender === 'female' && (
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  ✨ You receive an additional <strong>2 years age relaxation</strong> in every category as per DGS guidelines.
                </div>
              )}
            </div>
          )}

          {/* STEP 6 — Island Native (ST only) */}
          {step === 6 && (
            <div>
              <h1 className="font-display text-2xl font-bold text-primary mb-1">Are you from Lakshadweep or Andaman &amp; Nicobar Islands?</h1>
              <p className="text-text-secondary text-sm mb-6">
                Scheduled Tribe candidates from these islands get 5% relaxation in English marks requirement as per DGS guidelines.
              </p>
              <div className="flex gap-3">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((o) => (
                  <button
                    key={String(o.value)}
                    onClick={() => up({ isIslandStNative: o.value })}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                      w.isIslandStNative === o.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Next button (not shown on step 1 — auto-advance) */}
          {step > 1 && (
            <button
              onClick={next}
              disabled={!canProceed()}
              className={`w-full mt-8 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition ${
                canProceed()
                  ? 'bg-accent text-primary hover:bg-accent-dark'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? 'Check My Eligibility' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EligibilityPage() {
  return (
    <Suspense>
      <EligibilityWizardInner />
    </Suspense>
  )
}
