'use client'

import Link from 'next/link'
import { Heart, Star, MapPin, AlertTriangle, Shield, Plus } from 'lucide-react'
import { useSavedColleges } from '@/hooks/useSavedColleges'
import { useComparison } from '@/hooks/useComparison'

export interface CollegeCardCollege {
  id: string
  slug: string
  name: string
  type: string
  dgs_approval_status: string
  city: string | null
  state: string | null
  imu_affiliated: boolean
  is_active: boolean
  is_partner: boolean
  rating_avg: number | null
  rating_count: number
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  dgs_approval_number?: string | null
  last_dgs_verified?: string | null
  established_year?: number | null
  total_seats?: number | null
  hostel_available?: boolean
  description?: string | null
}

interface CollegeCourse {
  course_slug: string
  course_id: string
  annual_fees: number
}

interface CollegeCardProps {
  college: CollegeCardCollege
  courses?: CollegeCourse[]
}

function statusColor(status: string) {
  if (status === 'approved') return '#00C896'
  if (status === 'pending' || status === 'suspended') return '#FFB347'
  return '#FF6B6B'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    approved: 'DGS Approved',
    pending: 'Pending Verification',
    suspended: 'Suspended',
    not_listed: 'Not Listed',
    flagged: 'Flagged',
  }
  return map[status] ?? status
}

const COURSE_NAME_MAP: Record<string, string> = {
  'bsc-nautical-science': 'B.Sc. Nautical',
  'dns-diploma-nautical-science': 'DNS',
  'be-btech-marine-engineering': 'BE Marine Engg',
  'graduate-marine-engineering': 'GME',
  'diploma-marine-engineering': 'DMET',
  'electro-technical-officer': 'ETO',
  'gp-rating': 'GP Rating',
  'maritime-catering-ccmc': 'CCMC',
}

export function CollegeCard({ college, courses = [] }: CollegeCardProps) {
  const { isSaved, toggle } = useSavedColleges()
  const { toggle: toggleComparison, isInComparison } = useComparison()
  const saved = isSaved(college.id)
  const isFlagged = college.dgs_approval_status === 'not_listed' || college.dgs_approval_status === 'flagged'
  const color = statusColor(college.dgs_approval_status)

  const visibleCourses = courses.slice(0, 3)
  const extraCount = courses.length - 3

  return (
    <div className="relative bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden">
      {/* Left status strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />

      <div className="pl-4 pr-5 pt-5 pb-4">
        {/* Fraud warning */}
        {isFlagged && (
          <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
            <p className="text-danger text-xs font-semibold">
              Warning: This college is {statusLabel(college.dgs_approval_status)} by DGS
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                <Shield className="w-3 h-3" />
                {statusLabel(college.dgs_approval_status)}
              </span>
              {college.imu_affiliated && (
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  IMU
                </span>
              )}
            </div>
            <h3 className="font-display font-semibold text-primary text-base leading-snug line-clamp-2">
              {college.name}
            </h3>
          </div>
          <button
            onClick={() => toggle(college.id)}
            aria-label={saved ? 'Unsave college' : 'Save college'}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-surface transition"
          >
            <Heart
              className="w-4 h-4"
              fill={saved ? '#FF6B6B' : 'none'}
              stroke={saved ? '#FF6B6B' : '#94A3B8'}
            />
          </button>
        </div>

        {/* Location */}
        {(college.city || college.state) && (
          <div className="flex items-center gap-1 text-sm text-text-secondary mb-3">
            <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <span>{[college.city, college.state].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Rating */}
        {college.rating_avg != null && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-sm font-semibold text-text-primary">{college.rating_avg.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({college.rating_count} reviews)</span>
          </div>
        )}

        {/* Course pills */}
        {courses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visibleCourses.map((cc) => (
              <span
                key={cc.course_slug}
                className="text-xs bg-surface text-text-secondary border border-border rounded-full px-2.5 py-0.5"
              >
                {COURSE_NAME_MAP[cc.course_slug] ?? cc.course_slug}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="text-xs bg-surface text-text-muted border border-border rounded-full px-2.5 py-0.5">
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Link
            href={`/colleges/${college.slug}`}
            className="flex-1 text-center text-sm font-semibold text-accent hover:text-accent-dark transition"
          >
            View Details →
          </Link>
          <button
            onClick={() => toggleComparison(college.id)}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              isInComparison(college.id)
                ? 'bg-accent text-primary border-accent'
                : 'border-border text-text-secondary hover:bg-surface'
            }`}
          >
            <Plus className="w-3 h-3" />
            Compare
          </button>
        </div>
      </div>
    </div>
  )
}
