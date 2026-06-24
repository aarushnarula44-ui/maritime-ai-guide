'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'saved_colleges'

function getIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useSavedColleges() {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getIds())
  }, [])

  const toggle = useCallback((collegeId: string) => {
    setSaved((prev) => {
      const next = prev.includes(collegeId)
        ? prev.filter((id) => id !== collegeId)
        : [...prev, collegeId]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
    fetch(`/api/colleges/${collegeId}/save`, { method: 'POST' }).catch(() => {})
  }, [])

  const isSaved = useCallback(
    (collegeId: string) => saved.includes(collegeId),
    [saved]
  )

  return { saved, toggle, isSaved }
}
