'use client'

import Link from 'next/link'
import { Heart, Clock, GraduationCap, DollarSign, CheckCircle } from 'lucide-react'
import { useSavedCourses } from '@/hooks/useSavedCourses'
import type { Database } from '@/lib/supabase/types'

type CourseRow = Database['public']['Tables']['courses']['Row']

const DEPT_COLORS: Record<string, string> = {
  deck: '#1E3A5F',
  engine: '#0F4C35',
  eto: '#3D1A6E',
  ratings: '#1A4A2E',
  catering: '#4A2A1A',
}

const DEPT_LABELS: Record<string, string> = {
  deck: 'Deck',
  engine: 'Engine',
  eto: 'ETO',
  ratings: 'Ratings',
  catering: 'Catering',
}

interface CourseCardProps {
  course: CourseRow
  showEligibility?: boolean
  eligibilityStatus?: 'eligible' | 'close' | null
}

export function CourseCard({ course, showEligibility, eligibilityStatus }: CourseCardProps) {
  const { isSaved, toggle } = useSavedCourses()
  const deptColor = course.banner_color ?? DEPT_COLORS[course.department] ?? '#1E3A5F'
  const saved = isSaved(course.id)

  return (
    <div className="relative bg-white rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Department color strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: deptColor }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-1 text-white"
              style={{ backgroundColor: deptColor }}
            >
              {DEPT_LABELS[course.department] ?? course.department}
            </span>
            <h3 className="font-display font-semibold text-primary text-base leading-snug line-clamp-2">
              {course.name}
            </h3>
          </div>
          <button
            onClick={() => toggle(course.id)}
            aria-label={saved ? 'Unsave course' : 'Save course'}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-surface transition"
          >
            <Heart
              className="w-4 h-4"
              fill={saved ? '#FF6B6B' : 'none'}
              stroke={saved ? '#FF6B6B' : '#94A3B8'}
            />
          </button>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        {/* Key facts */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
            <span>{course.duration_display}</span>
          </div>
          {course.display_max_age && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
              <span>Max age {course.display_max_age}</span>
            </div>
          )}
          {course.salary_display && (
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{course.salary_display}</span>
            </div>
          )}
        </div>

        {/* CET badge */}
        {course.cet_required && (
          <div className="flex items-center gap-1.5 mb-4">
            <CheckCircle className="w-3.5 h-3.5 text-warning" />
            <span className="text-xs text-warning font-medium">IMU-CET Required</span>
          </div>
        )}

        {/* Eligibility badge */}
        {showEligibility && eligibilityStatus && (
          <div className={`mb-4 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            eligibilityStatus === 'eligible'
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}>
            {eligibilityStatus === 'eligible' ? '✓ You are eligible' : '~ You are close to eligible'}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark transition group-hover:gap-2"
        >
          Explore <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
