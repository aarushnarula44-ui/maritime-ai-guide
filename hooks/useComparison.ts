'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'comparison_colleges'
const MAX = 3

function getIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function broadcast() {
  window.dispatchEvent(new Event('comparison-updated'))
}

export function useComparison() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(getIds())
    const handler = () => setIds(getIds())
    window.addEventListener('comparison-updated', handler)
    return () => window.removeEventListener('comparison-updated', handler)
  }, [])

  const add = useCallback((id: string) => {
    const current = getIds()
    if (current.includes(id) || current.length >= MAX) return
    const next = [...current, id]
    localStorage.setItem(KEY, JSON.stringify(next))
    setIds(next)
    broadcast()
  }, [])

  const remove = useCallback((id: string) => {
    const next = getIds().filter((x) => x !== id)
    localStorage.setItem(KEY, JSON.stringify(next))
    setIds(next)
    broadcast()
  }, [])

  const toggle = useCallback((id: string) => {
    const current = getIds()
    if (current.includes(id)) {
      remove(id)
    } else {
      add(id)
    }
  }, [add, remove])

  const clear = useCallback(() => {
    localStorage.setItem(KEY, '[]')
    setIds([])
    broadcast()
  }, [])

  const isInComparison = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, add, remove, toggle, clear, isInComparison, canAdd: ids.length < MAX }
}
