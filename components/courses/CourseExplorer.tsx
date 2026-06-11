'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { CourseCard } from '@/components/courses/CourseCard'
import type { Database } from '@/lib/supabase/types'

type CourseRow = Database['public']['Tables']['courses']['Row']

const DEPT_FILTERS = ['All', 'Deck', 'Engine', 'ETO', 'Ratings', 'Catering'] as const
type DeptFilter = typeof DEPT_FILTERS[number]

const QUAL_FILTERS = [
  { label: 'Class 10', value: 'class10' },
  { label: 'Class 12 PCM', value: 'class12pcm' },
  { label: 'Diploma', value: 'diploma' },
  { label: 'Graduate', value: 'graduate' },
]

const DURATION_FILTERS = [
  { label: 'Under 1 Year', value: 'under1' },
  { label: '1–2 Years', value: '1to2' },
  { label: '3–4 Years', value: '3to4' },
]

const CET_FILTERS = [
  { label: 'CET Required', value: 'yes' },
  { label: 'No CET', value: 'no' },
]

function matchesQual(course: CourseRow, qual: string): boolean {
  const dept = course.department
  const months = course.duration_months
  if (qual === 'class10') return months <= 6 || dept === 'ratings'
  if (qual === 'class12pcm') return dept === 'deck' || dept === 'engine'
  if (qual === 'diploma') return dept === 'engine'
  if (qual === 'graduate') return !course.cet_required
  return true
}

function matchesDuration(course: CourseRow, dur: string): boolean {
  const m = course.duration_months
  if (dur === 'under1') return m < 12
  if (dur === '1to2') return m >= 12 && m <= 24
  if (dur === '3to4') return m >= 36 && m <= 48
  return true
}

interface CourseExplorerProps {
  courses: CourseRow[]
}

export function CourseExplorer({ courses }: CourseExplorerProps) {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState<DeptFilter>('All')
  const [quals, setQuals] = useState<string[]>([])
  const [durations, setDurations] = useState<string[]>([])
  const [cet, setCet] = useState<string[]>([])

  function toggleFilter<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  const hasFilters = dept !== 'All' || quals.length > 0 || durations.length > 0 || cet.length > 0 || search.length > 0

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false
      }
      if (dept !== 'All' && c.department !== dept.toLowerCase()) return false
      if (quals.length > 0 && !quals.some((q) => matchesQual(c, q))) return false
      if (durations.length > 0 && !durations.some((d) => matchesDuration(c, d))) return false
      if (cet.length > 0) {
        if (cet.includes('yes') && !c.cet_required) return false
        if (cet.includes('no') && c.cet_required) return false
      }
      return true
    })
  }, [courses, search, dept, quals, durations, cet])

  const chipCls = (active: boolean) =>
    `text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer select-none ${
      active
        ? 'bg-accent text-primary border-accent'
        : 'bg-white text-text-secondary border-border hover:border-accent/50'
    }`

  return (
    <div>
      {/* Search + filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>

        {/* Department chips */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Department</p>
          <div className="flex flex-wrap gap-2">
            {DEPT_FILTERS.map((d) => (
              <button key={d} onClick={() => setDept(d)} className={chipCls(dept === d)}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Qualification */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Qualification</p>
          <div className="flex flex-wrap gap-2">
            {QUAL_FILTERS.map((q) => (
              <button
                key={q.value}
                onClick={() => toggleFilter(quals, q.value, setQuals)}
                className={chipCls(quals.includes(q.value))}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration + CET row */}
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_FILTERS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggleFilter(durations, d.value, setDurations)}
                  className={chipCls(durations.includes(d.value))}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">CET</p>
            <div className="flex flex-wrap gap-2">
              {CET_FILTERS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => toggleFilter(cet, c.value, setCet)}
                  className={chipCls(cet.includes(c.value))}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear + count */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-primary">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''} found
          </p>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setDept('All'); setQuals([]); setDurations([]); setCet([]) }}
              className="text-sm text-accent hover:text-accent-dark font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No courses match your filters.</p>
          <button
            onClick={() => { setSearch(''); setDept('All'); setQuals([]); setDurations([]); setCet([]) }}
            className="mt-3 text-accent font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
