'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, BookOpen, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  slug: string
  name: string
  subtitle: string
  type: 'course' | 'college'
}

interface SearchResults {
  courses: SearchResult[]
  colleges: SearchResult[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ courses: [], colleges: [] })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounced = useDebounce(query, 300)

  const allResults = [...results.courses, ...results.colleges]

  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setResults({ courses: [], colleges: [] })
      setOpen(false)
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setOpen(true)
        setActiveIndex(-1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [debounced])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && allResults[activeIndex]) {
        const r = allResults[activeIndex]
        router.push(r.type === 'course' ? `/courses/${r.slug}` : `/colleges/${r.slug}`)
        close()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const hasResults = results.courses.length > 0 || results.colleges.length > 0

  return (
    <div className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, colleges..."
          className="w-56 lg:w-72 pl-9 pr-8 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-border overflow-hidden animate-fade-in z-50"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-text-muted">Searching...</div>
          )}

          {!loading && !hasResults && debounced.length >= 2 && (
            <div className="px-4 py-4 text-sm text-text-muted text-center">
              No results for &quot;{debounced}&quot;
            </div>
          )}

          {!loading && results.courses.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-surface border-b border-border">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Courses
                </p>
              </div>
              {results.courses.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/courses/${r.slug}`}
                  onClick={close}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-surface transition ${activeIndex === i ? 'bg-surface' : ''}`}
                >
                  <BookOpen className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">{r.name}</p>
                    <p className="text-xs text-text-muted">{r.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && results.colleges.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-surface border-b border-border">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Colleges
                </p>
              </div>
              {results.colleges.map((r, i) => {
                const idx = results.courses.length + i
                return (
                  <Link
                    key={r.id}
                    href={`/colleges/${r.slug}`}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-surface transition ${activeIndex === idx ? 'bg-surface' : ''}`}
                  >
                    <Building2 className="w-4 h-4 text-primary-light flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary">{r.name}</p>
                      <p className="text-xs text-text-muted">{r.subtitle}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {hasResults && (
            <div className="px-4 py-2.5 border-t border-border">
              <Link
                href={`/courses?q=${encodeURIComponent(query)}`}
                onClick={close}
                className="text-xs text-accent hover:underline font-medium"
              >
                See all results →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
