'use client'

import { useComparison } from '@/hooks/useComparison'
import Link from 'next/link'
import { X, GitCompare } from 'lucide-react'

interface College {
  id: string
  name: string
}

interface ComparisonDrawerProps {
  colleges: College[]
}

export function ComparisonDrawer({ colleges }: ComparisonDrawerProps) {
  const { ids, remove, clear } = useComparison()

  if (ids.length === 0) return null

  const selectedColleges = ids.map((id) => colleges.find((c) => c.id === id)).filter(Boolean) as College[]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-primary text-white rounded-2xl shadow-floating px-5 py-3 flex items-center gap-4">
        <GitCompare className="w-5 h-5 text-accent flex-shrink-0" />

        <div className="flex items-center gap-2">
          {selectedColleges.map((col) => (
            <div key={col.id} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1">
              <span className="text-sm font-medium truncate max-w-[120px]">{col.name}</span>
              <button
                onClick={() => remove(col.id)}
                className="text-white/60 hover:text-white transition"
                aria-label="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {ids.length < 3 && (
            <div className="bg-white/10 border border-white/20 border-dashed rounded-lg px-3 py-1 text-sm text-white/40">
              + Add
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {ids.length >= 2 && (
            <Link
              href={`/colleges/compare?ids=${ids.join(',')}`}
              className="bg-accent text-primary text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-accent-dark transition"
            >
              Compare Now
            </Link>
          )}
          <button
            onClick={clear}
            className="text-white/60 hover:text-white transition text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
