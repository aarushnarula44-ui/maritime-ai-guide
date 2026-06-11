'use client'

import { useEffect } from 'react'
import { cacheEligibilityRules } from '@/lib/eligibility/cache'

export default function EligibilityCacheInit() {
  useEffect(() => {
    cacheEligibilityRules()
  }, [])
  return null
}
