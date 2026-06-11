'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'saved_courses'

function getIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useSavedCourses() {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getIds())
  }, [])

  const toggle = useCallback((courseId: string) => {
    setSaved((prev) => {
      const next = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isSaved = useCallback(
    (courseId: string) => saved.includes(courseId),
    [saved]
  )

  return { saved, toggle, isSaved }
}
