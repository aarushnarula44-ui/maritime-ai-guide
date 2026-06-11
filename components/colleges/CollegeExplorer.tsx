'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { CollegeCard } from '@/components/colleges/CollegeCard'
import type { StaticCollege, StaticCollegeCourse } from '@/lib/static-data'

const SORT_OPTIONS = [
  { label: 'Best Rating', value: 'rating' },
  { label: 'Name (A–Z)', value: 'name' },
  { label: 'Established Year', value: 'year' },
]

const PAGE_SIZE = 12

interface CollegeExplorerProps {
  colleges: StaticCollege[]
  collegeCourses: StaticCollegeCourse[]
}

export function CollegeExplorer({ colleges, collegeCourses }: CollegeExplorerProps) {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [dgsFilter, setDgsFilter] = useState('')
  const [imuOnly, setImuOnly] = useState(false)
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const allStates = Array.from(new Set(colleges.map((c) => c.state).filter(Boolean) as string[])).sort()

  const filtered = useMemo(() => {
    let list = colleges.filter((c) => {
      if (search) {
        const q = search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !c.city?.toLowerCase().includes(q)) return false
      }
      if (stateFilter && c.state !== stateFilter) return false
      if (dgsFilter && c.dgs_approval_status !== dgsFilter) return false
      if (imuOnly && !c.imu_affiliated) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'rating') return (b.rating_avg ?? 0) - (a.rating_avg ?? 0)
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'year') return (b.established_year ?? 0) - (a.established_year ?? 0)
      return 0
    })

    return list
  }, [colleges, search, stateFilter, dgsFilter, imuOnly, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilters() {
    setSearch('')
    setStateFilter('')
    setDgsFilter('')
    setImuOnly(false)
    setPage(1)
  }

  const hasFilters = search || stateFilter || dgsFilter || imuOnly

  const chipCls = (active: boolean) =>
    `text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer select-none ${
      active
        ? 'bg-accent text-primary border-accent'
        : 'bg-white text-text-secondary border-border hover:border-accent/50'
    }`

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition ${showFilters ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:bg-surface'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6 animate-fade-in">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* State */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">State</p>
              <select
                value={stateFilter}
                onChange={(e) => { setStateFilter(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
              >
                <option value="">All States</option>
                {allStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* DGS Status */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">DGS Status</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'All', value: '' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Pending', value: 'pending' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setDgsFilter(f.value); setPage(1) }}
                    className={chipCls(dgsFilter === f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* IMU */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Affiliation</p>
              <button
                onClick={() => { setImuOnly(!imuOnly); setPage(1) }}
                className={chipCls(imuOnly)}
              >
                IMU Affiliated Only
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-primary">{filtered.length}</span> college{filtered.length !== 1 ? 's' : ''} found
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-accent hover:text-accent-dark font-medium">
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {!showFilters && (
        <p className="text-sm text-text-secondary mb-4">
          Showing <span className="font-semibold text-primary">{filtered.length}</span> college{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* List */}
      {paginated.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No colleges match your filters.</p>
          <button onClick={clearFilters} className="mt-3 text-accent font-medium hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((college) => {
            const courses = collegeCourses.filter((cc) => cc.college_slug === college.slug)
            return (
              <CollegeCard
                key={college.id}
                college={college}
                courses={courses}
              />
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-surface transition"
          >
            Previous
          </button>
          <span className="text-sm text-text-secondary px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-surface transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
