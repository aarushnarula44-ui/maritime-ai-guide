import { COURSE_RULES, type CourseWithRules } from './engine'

const CACHE_KEY = 'maritime_eligibility_rules'
const CACHE_TS_KEY = 'maritime_eligibility_rules_cached_at'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export function cacheEligibilityRules(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(COURSE_RULES))
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString())
  } catch {
    // localStorage unavailable (private mode, storage full, etc.)
  }
}

export function getCachedRules(): CourseWithRules[] | null {
  if (typeof window === 'undefined') return null
  try {
    const ts = localStorage.getItem(CACHE_TS_KEY)
    if (!ts || Date.now() - Number(ts) > CACHE_TTL_MS) return null
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CourseWithRules[]) : null
  } catch {
    return null
  }
}

export function isOfflineCapable(): boolean {
  return getCachedRules() !== null
}
