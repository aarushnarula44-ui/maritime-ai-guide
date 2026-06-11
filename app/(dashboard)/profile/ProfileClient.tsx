'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Pencil, Check, X } from 'lucide-react'

// ─────────── Types ───────────
interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  state: string | null
  city: string | null
  category: string | null
  language_preference: string
  is_island_st_native: boolean
  onboarding_completed: boolean
  created_at: string
}

interface AcademicProfile {
  qualification: string | null
  board_10: string | null
  board_12: string | null
  year_of_passing_10: number | null
  year_of_passing_12: number | null
  aggregate_percentage_10: number | null
  english_percentage_10: number | null
  physics_percentage: number | null
  chemistry_percentage: number | null
  maths_percentage: number | null
  pcm_percentage: number | null
  english_percentage_12: number | null
  diploma_field: string | null
  diploma_percentage: number | null
  diploma_english_medium: boolean
  degree_field: string | null
  degree_percentage: number | null
  degree_university: string | null
  degree_english_medium: boolean
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

// ─────────── Inline edit field ───────────
function EditableField({
  label, value, name, type = 'text', options, onSave,
}: {
  label: string
  value: string | null
  name: string
  type?: string
  options?: { value: string; label: string }[]
  onSave: (name: string, value: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(name, draft)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-xs text-text-muted mb-0.5">{label}</p>
        {editing ? (
          options ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="border border-border rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">— Select —</option>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="border border-border rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent"
            />
          )
        ) : (
          <p className="text-sm text-text-primary">{value || <span className="text-text-muted italic">Not set</span>}</p>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving} className="p-1.5 text-success hover:bg-green-50 rounded-lg transition">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditing(false); setDraft(value ?? '') }} className="p-1.5 text-danger hover:bg-red-50 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="p-1.5 text-text-muted hover:text-primary rounded-lg transition opacity-0 group-hover:opacity-100 hover:opacity-100">
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ─────────── Profile completion ───────────
function CompletionChecklist({ profile, academic, hasEligibility, hasCourse, hasTest, hasCollege }: {
  profile: Profile
  academic: AcademicProfile | null
  hasEligibility: boolean
  hasCourse: boolean
  hasTest: boolean
  hasCollege: boolean
}) {
  const items = [
    { label: 'Basic info added', done: !!(profile.full_name && profile.email), href: null },
    { label: 'Academic details added', done: !!academic, href: '#academic' },
    { label: 'Eligibility check completed', done: hasEligibility, href: '/eligibility' },
    { label: 'Course saved', done: hasCourse, href: '/courses' },
    { label: 'CET mock test taken', done: hasTest, href: '/cet/practice' },
    { label: 'College saved', done: hasCollege, href: '/colleges' },
  ]
  const done = items.filter((i) => i.done).length
  const pct = Math.round((done / items.length) * 100)

  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text-primary">Profile Completion</h3>
        <span className="text-sm font-bold text-accent">{pct}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full mb-4">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${item.done ? 'bg-success text-white' : 'bg-surface border border-border text-text-muted'}`}>
              {item.done ? '✓' : '○'}
            </span>
            {item.done || !item.href ? (
              <span className={item.done ? 'text-text-primary' : 'text-text-muted'}>{item.label}</span>
            ) : (
              <Link href={item.href} className="text-accent hover:underline">{item.label}</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────── Academic tab ───────────
const academicSchema = z.object({
  qualification: z.enum(['class_10', 'class_11', 'class_12', 'diploma', 'engineering_grad', 'bsc_grad', 'other_grad']).nullable().optional(),
  board_10: z.string().optional(),
  year_of_passing_10: z.number().int().min(1990).max(2030).nullable().optional(),
  aggregate_percentage_10: z.number().min(0).max(100).nullable().optional(),
  english_percentage_10: z.number().min(0).max(100).nullable().optional(),
  board_12: z.string().optional(),
  year_of_passing_12: z.number().int().min(1990).max(2030).nullable().optional(),
  physics_percentage: z.number().min(0).max(100).nullable().optional(),
  chemistry_percentage: z.number().min(0).max(100).nullable().optional(),
  maths_percentage: z.number().min(0).max(100).nullable().optional(),
  english_percentage_12: z.number().min(0).max(100).nullable().optional(),
  diploma_field: z.string().optional(),
  diploma_percentage: z.number().min(0).max(100).nullable().optional(),
  diploma_english_medium: z.boolean().optional(),
  degree_field: z.string().optional(),
  degree_percentage: z.number().min(0).max(100).nullable().optional(),
  degree_university: z.string().optional(),
  degree_english_medium: z.boolean().optional(),
})

type AcademicFormData = z.infer<typeof academicSchema>

function AcademicTab({ initial }: { initial: AcademicProfile | null }) {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<AcademicFormData>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
      qualification: (initial?.qualification as AcademicFormData['qualification']) ?? null,
      board_10: initial?.board_10 ?? '',
      year_of_passing_10: initial?.year_of_passing_10 ?? undefined,
      aggregate_percentage_10: initial?.aggregate_percentage_10 ?? undefined,
      english_percentage_10: initial?.english_percentage_10 ?? undefined,
      board_12: initial?.board_12 ?? '',
      year_of_passing_12: initial?.year_of_passing_12 ?? undefined,
      physics_percentage: initial?.physics_percentage ?? undefined,
      chemistry_percentage: initial?.chemistry_percentage ?? undefined,
      maths_percentage: initial?.maths_percentage ?? undefined,
      english_percentage_12: initial?.english_percentage_12 ?? undefined,
      diploma_field: initial?.diploma_field ?? '',
      diploma_percentage: initial?.diploma_percentage ?? undefined,
      diploma_english_medium: initial?.diploma_english_medium ?? false,
      degree_field: initial?.degree_field ?? '',
      degree_percentage: initial?.degree_percentage ?? undefined,
      degree_university: initial?.degree_university ?? '',
      degree_english_medium: initial?.degree_english_medium ?? false,
    },
  })

  const [toast, setToast] = useState('')
  const qualification = watch('qualification')
  const physics = watch('physics_percentage')
  const chemistry = watch('chemistry_percentage')
  const maths = watch('maths_percentage')

  const pcmAvg = physics != null && chemistry != null && maths != null
    ? Math.round(((Number(physics) + Number(chemistry) + Number(maths)) / 3) * 10) / 10
    : null

  const show12 = ['class_12', 'diploma', 'engineering_grad', 'bsc_grad', 'other_grad'].includes(qualification ?? '')
  const showDiploma = ['diploma', 'engineering_grad', 'bsc_grad', 'other_grad'].includes(qualification ?? '')
  const showDegree = ['engineering_grad', 'bsc_grad', 'other_grad'].includes(qualification ?? '')

  async function onSubmit(data: AcademicFormData) {
    const res = await fetch('/api/user/academic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setToast('Academic details saved!')
      setTimeout(() => setToast(''), 3000)
    }
  }

  const inputClass = 'border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent'
  const labelClass = 'block text-xs text-text-muted mb-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {toast && <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">{toast}</div>}

      <div>
        <label className={labelClass}>Highest Qualification</label>
        <select {...register('qualification')} className={inputClass}>
          <option value="">— Select —</option>
          <option value="class_10">Class 10</option>
          <option value="class_11">Class 11</option>
          <option value="class_12">Class 12</option>
          <option value="diploma">Diploma</option>
          <option value="engineering_grad">Engineering Graduate</option>
          <option value="bsc_grad">B.Sc Graduate</option>
          <option value="other_grad">Other Graduate</option>
        </select>
      </div>

      {/* Class 10 */}
      <div className="border border-border rounded-xl p-4 space-y-4">
        <h4 className="font-medium text-text-primary text-sm">Class 10</h4>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Board</label><input {...register('board_10')} className={inputClass} placeholder="CBSE, ICSE..." /></div>
          <div><label className={labelClass}>Year of Passing</label><input type="number" {...register('year_of_passing_10')} className={inputClass} /></div>
          <div><label className={labelClass}>Overall %</label><input type="number" step="0.01" {...register('aggregate_percentage_10')} className={inputClass} /></div>
          <div><label className={labelClass}>English %</label><input type="number" step="0.01" {...register('english_percentage_10')} className={inputClass} /></div>
        </div>
      </div>

      {/* Class 12 */}
      {show12 && (
        <div className="border border-border rounded-xl p-4 space-y-4">
          <h4 className="font-medium text-text-primary text-sm">Class 12</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Board</label><input {...register('board_12')} className={inputClass} /></div>
            <div><label className={labelClass}>Year of Passing</label><input type="number" {...register('year_of_passing_12')} className={inputClass} /></div>
            <div><label className={labelClass}>Physics %</label><input type="number" step="0.01" {...register('physics_percentage')} className={inputClass} /></div>
            <div><label className={labelClass}>Chemistry %</label><input type="number" step="0.01" {...register('chemistry_percentage')} className={inputClass} /></div>
            <div><label className={labelClass}>Maths %</label><input type="number" step="0.01" {...register('maths_percentage')} className={inputClass} /></div>
            <div><label className={labelClass}>English %</label><input type="number" step="0.01" {...register('english_percentage_12')} className={inputClass} /></div>
          </div>
          {pcmAvg != null && (
            <p className="text-sm text-accent font-semibold">PCM Average: {pcmAvg}%</p>
          )}
        </div>
      )}

      {/* Diploma */}
      {showDiploma && (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-text-primary text-sm">Diploma</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Field/Stream</label><input {...register('diploma_field')} className={inputClass} /></div>
            <div><label className={labelClass}>Percentage</label><input type="number" step="0.01" {...register('diploma_percentage')} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" {...register('diploma_english_medium')} className="rounded" />
            Medium of instruction: English
          </label>
        </div>
      )}

      {/* Degree */}
      {showDegree && (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-text-primary text-sm">Degree</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Field/Stream</label><input {...register('degree_field')} className={inputClass} /></div>
            <div><label className={labelClass}>Percentage</label><input type="number" step="0.01" {...register('degree_percentage')} className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>University</label><input {...register('degree_university')} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" {...register('degree_english_medium')} className="rounded" />
            Medium of instruction: English
          </label>
        </div>
      )}

      <div>
        <Button type="submit" loading={isSubmitting}>Save Academic Details</Button>
        <p className="text-xs text-text-muted mt-2">Your eligibility will be recalculated with updated marks</p>
      </div>
    </form>
  )
}

// ─────────── Progress tab ───────────
function ProgressTab({ perf, tests }: {
  perf: { mathematics_avg: number | null; physics_avg: number | null; chemistry_avg: number | null; english_avg: number | null; aptitude_avg: number | null; overall_avg: number | null; tests_taken: number; best_score: number | null } | null
  tests: Array<{ id: string; test_type: string; score: number | null; max_score: number | null; time_taken_seconds: number | null; created_at: string }>
}) {
  const BADGES = [
    { id: 'first_steps', label: 'First Steps', icon: '🎓', desc: 'Complete eligibility check' },
    { id: 'explorer', label: 'Explorer', icon: '🔭', desc: 'View 5 courses' },
    { id: 'test_taker', label: 'Test Taker', icon: '📝', desc: 'Complete first mock test' },
    { id: 'high_scorer', label: 'High Scorer', icon: '🏆', desc: 'Score above 80%' },
    { id: 'committed', label: 'Committed', icon: '⭐', desc: 'Complete full profile' },
    { id: 'researcher', label: 'Researcher', icon: '🔬', desc: 'Save 3 colleges' },
  ]

  const earnedBadges: string[] = []
  if (perf && perf.tests_taken > 0) earnedBadges.push('test_taker')
  if (perf?.best_score != null && perf.best_score >= 80) earnedBadges.push('high_scorer')

  const subjects = [
    { label: 'Mathematics', value: perf?.mathematics_avg },
    { label: 'Physics', value: perf?.physics_avg },
    { label: 'Chemistry', value: perf?.chemistry_avg },
    { label: 'English', value: perf?.english_avg },
    { label: 'General Aptitude', value: perf?.aptitude_avg },
  ]

  return (
    <div className="space-y-6">
      {perf && perf.tests_taken > 0 ? (
        <div>
          <h3 className="font-semibold text-text-primary mb-4">CET Performance</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-surface rounded-xl">
              <p className="font-display text-3xl font-bold text-accent">{perf.overall_avg?.toFixed(0) ?? '—'}%</p>
              <p className="text-xs text-text-muted mt-1">Overall Average</p>
            </div>
            <div className="text-center p-4 bg-surface rounded-xl">
              <p className="font-display text-3xl font-bold text-primary">{perf.best_score?.toFixed(0) ?? '—'}%</p>
              <p className="text-xs text-text-muted mt-1">Best Score</p>
            </div>
            <div className="text-center p-4 bg-surface rounded-xl">
              <p className="font-display text-3xl font-bold text-primary">{perf.tests_taken}</p>
              <p className="text-xs text-text-muted mt-1">Tests Taken</p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {subjects.filter((s) => s.value != null).map((s) => {
              const v = s.value!
              const color = v >= 70 ? 'bg-success' : v >= 50 ? 'bg-warning' : 'bg-danger'
              const tc = v >= 70 ? 'text-success' : v >= 50 ? 'text-warning' : 'text-danger'
              return (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text-secondary">{s.label}</span>
                    <span className={`text-xs font-semibold ${tc}`}>{v.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full"><div className={`h-full ${color} rounded-full`} style={{ width: `${v}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm mb-3">No test attempts yet</p>
          <Link href="/cet/practice" className="inline-block bg-accent text-primary font-semibold text-sm px-4 py-2 rounded-lg hover:bg-accent-dark transition">Take Mock Test →</Link>
        </div>
      )}

      {tests.length > 0 && (
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Recent Mock Tests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-text-muted font-medium text-xs">Date</th><th className="text-left py-2 text-text-muted font-medium text-xs">Type</th><th className="text-left py-2 text-text-muted font-medium text-xs">Score</th><th className="text-left py-2 text-text-muted font-medium text-xs">Time</th></tr></thead>
              <tbody>
                {tests.map((t) => {
                  const score = t.score != null && t.max_score != null ? `${t.score}/${t.max_score}` : '—'
                  const mins = t.time_taken_seconds != null ? `${Math.round(t.time_taken_seconds / 60)}m` : '—'
                  return (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-2 text-text-secondary">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-2 text-text-primary">{t.test_type}</td>
                      <td className="py-2 font-semibold text-text-primary">{score}</td>
                      <td className="py-2 text-text-secondary">{mins}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-text-primary mb-3">Achievements</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BADGES.map((b) => {
            const earned = earnedBadges.includes(b.id)
            return (
              <div key={b.id} title={b.desc} className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center ${earned ? 'border-accent bg-accent/5' : 'border-border bg-surface opacity-50'}`}>
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[11px] font-medium text-text-secondary">{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────── Saved items tab ───────────
function SavedItemsTab({ savedCourses, savedColleges }: {
  savedCourses: Array<{ id: string; course_id: string; courses: { id: string; name: string; department: string; duration_display: string } | null }>
  savedColleges: Array<{ id: string; college_id: string; colleges: { id: string; name: string; city: string | null; state: string | null; dgs_approval_status: string } | null }>
}) {
  const [removingCourse, setRemovingCourse] = useState<string | null>(null)
  const [removingCollege, setRemovingCollege] = useState<string | null>(null)
  const [courses, setCourses] = useState(savedCourses)
  const [colleges, setColleges] = useState(savedColleges)

  async function removeCourse(courseId: string) {
    setRemovingCourse(courseId)
    await fetch(`/api/courses/${courseId}/save`, { method: 'DELETE' })
    setCourses((prev) => prev.filter((c) => c.course_id !== courseId))
    setRemovingCourse(null)
  }

  async function removeCollege(collegeId: string) {
    setRemovingCollege(collegeId)
    await fetch(`/api/colleges/${collegeId}/save`, { method: 'DELETE' })
    setColleges((prev) => prev.filter((c) => c.college_id !== collegeId))
    setRemovingCollege(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-text-primary mb-4">Saved Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl">
            <p className="text-text-muted text-sm mb-2">No saved courses yet</p>
            <Link href="/courses" className="text-accent text-sm font-semibold hover:underline">Explore Courses →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((sc) => {
              const c = sc.courses
              if (!c) return null
              return (
                <div key={sc.id} className="flex items-center justify-between border border-border rounded-xl p-4">
                  <div>
                    <p className="font-medium text-sm text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{c.department} · {c.duration_display}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${sc.course_id}`} className="text-xs text-accent hover:underline">View →</Link>
                    <button
                      onClick={() => removeCourse(sc.course_id)}
                      disabled={removingCourse === sc.course_id}
                      className="p-1.5 text-text-muted hover:text-danger transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-4">Saved Colleges ({colleges.length})</h3>
        {colleges.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl">
            <p className="text-text-muted text-sm mb-2">No saved colleges yet</p>
            <Link href="/colleges" className="text-accent text-sm font-semibold hover:underline">Find Colleges →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {colleges.map((sc) => {
              const c = sc.colleges
              if (!c) return null
              return (
                <div key={sc.id} className="flex items-center justify-between border border-border rounded-xl p-4">
                  <div>
                    <p className="font-medium text-sm text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{[c.city, c.state].filter(Boolean).join(', ')} · DGS {c.dgs_approval_status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/colleges/${sc.college_id}`} className="text-xs text-accent hover:underline">View →</Link>
                    <button
                      onClick={() => removeCollege(sc.college_id)}
                      disabled={removingCollege === sc.college_id}
                      className="p-1.5 text-text-muted hover:text-danger transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────── Main export ───────────
export function ProfileClient({
  profile: initialProfile,
  academic: initialAcademic,
  hasEligibility,
  hasCourse,
  hasCollege,
  hasTest,
  cetPerformance,
  recentTests,
  savedCourses,
  savedColleges,
}: {
  profile: Profile
  academic: AcademicProfile | null
  hasEligibility: boolean
  hasCourse: boolean
  hasCollege: boolean
  hasTest: boolean
  cetPerformance: Parameters<typeof ProgressTab>[0]['perf'] | null
  recentTests: Parameters<typeof ProgressTab>[0]['tests']
  savedCourses: Parameters<typeof SavedItemsTab>[0]['savedCourses']
  savedColleges: Parameters<typeof SavedItemsTab>[0]['savedColleges']
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'progress' | 'saved'>('profile')
  const [toast, setToast] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email?.[0].toUpperCase() ?? '?'

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  async function saveField(name: string, value: string) {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [name]: value || null }),
    })
    if (res.ok) {
      const json = await res.json()
      setProfile(json.data)
      setToast('Saved!')
      setTimeout(() => setToast(''), 3000)
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    await fetch('/api/user/account/delete', { method: 'DELETE' })
    window.location.href = '/'
  }

  const TABS = [
    { id: 'profile' as const, label: 'My Profile' },
    { id: 'academic' as const, label: 'Academic Details' },
    { id: 'progress' as const, label: 'My Progress' },
    { id: 'saved' as const, label: 'Saved Items' },
  ]

  return (
    <div className="-mx-4 md:-mx-8 -mt-8">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-primary to-primary-light px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="relative group w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-accent text-primary flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <span className="text-white text-xs font-medium">Change Photo</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white">{profile.full_name || 'Your Name'}</h1>
            <span className="inline-block bg-accent text-primary text-xs font-semibold px-3 py-1 rounded-full mt-1">Maritime Aspirant</span>
            <p className="text-blue-300 text-sm mt-1">Joined {memberSince}</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {toast && <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">{toast}</div>}

        <CompletionChecklist
          profile={profile}
          academic={initialAcademic}
          hasEligibility={hasEligibility}
          hasCourse={hasCourse}
          hasTest={hasTest}
          hasCollege={hasCollege}
        />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-card p-6 space-y-1">
            <h3 className="font-semibold text-text-primary mb-2">Personal Information</h3>
            <div className="divide-y divide-border">
              {[
                { label: 'Full Name', name: 'full_name', value: profile.full_name },
                { label: 'Email', name: 'email', value: profile.email, readOnly: true },
                { label: 'Phone Number', name: 'phone', value: profile.phone },
                { label: 'Date of Birth', name: 'date_of_birth', value: profile.date_of_birth, type: 'date' },
              ].map((f) => (
                f.readOnly ? (
                  <div key={f.name} className="py-3 border-b border-border">
                    <p className="text-xs text-text-muted mb-0.5">{f.label}</p>
                    <p className="text-sm text-text-secondary">{f.value || '—'}</p>
                  </div>
                ) : (
                  <div key={f.name} className="group">
                    <EditableField label={f.label} name={f.name} value={f.value ?? null} type={f.type} onSave={saveField} />
                  </div>
                )
              ))}
              <div className="group">
                <EditableField
                  label="Gender" name="gender" value={profile.gender}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                  ]}
                  onSave={saveField}
                />
              </div>
              <div className="group">
                <EditableField
                  label="State" name="state" value={profile.state}
                  options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                  onSave={saveField}
                />
              </div>
              <div className="group">
                <EditableField label="City" name="city" value={profile.city} onSave={saveField} />
              </div>
              <div className="group">
                <EditableField
                  label="Category" name="category" value={profile.category}
                  options={[
                    { value: 'general', label: 'General' },
                    { value: 'sc', label: 'SC' },
                    { value: 'st', label: 'ST' },
                    { value: 'obc_ncl', label: 'OBC-NCL' },
                    { value: 'ews', label: 'EWS' },
                  ]}
                  onSave={saveField}
                />
              </div>
              <div className="group">
                <EditableField
                  label="Language Preference" name="language_preference" value={profile.language_preference}
                  options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }]}
                  onSave={saveField}
                />
              </div>
            </div>

            {profile.category === 'st' && (
              <div className="mt-4 flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Island ST Native</p>
                  <p className="text-xs text-text-muted">Are you a native of Lakshadweep or A&N Islands from a Scheduled Tribe?</p>
                </div>
                <button
                  onClick={() => saveField('is_island_st_native', String(!profile.is_island_st_native))}
                  className={`w-12 h-6 rounded-full transition-colors ${profile.is_island_st_native ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${profile.is_island_st_native ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            )}

            {/* Danger Zone */}
            <div className="mt-8 border border-danger/30 rounded-xl p-4">
              <h4 className="font-semibold text-danger text-sm mb-1">Danger Zone</h4>
              <p className="text-xs text-text-muted mb-3">This will permanently delete your account and all data.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-danger"
                />
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deleteConfirm !== 'DELETE'}
                  loading={deleting}
                  onClick={handleDelete}
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="font-semibold text-text-primary mb-4">Academic Details</h3>
            <AcademicTab initial={initialAcademic} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <ProgressTab perf={cetPerformance} tests={recentTests} />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <SavedItemsTab savedCourses={savedCourses} savedColleges={savedColleges} />
          </div>
        )}
      </div>
    </div>
  )
}
