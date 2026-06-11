export type IntentType = 'factual_lookup' | 'eligibility_query' | 'conversational' | 'out_of_scope'

export const MARITIME_KEYWORDS = [
  'merchant navy', 'maritime', 'seafarer', 'ship', 'vessel', 'nautical', 'marine',
  'sailing', 'sea', 'ocean', 'imu', 'cet', 'dgs', 'deck', 'engine', 'officer',
  'cadet', 'rating', 'eto', 'dns', 'gme', 'bsc', 'btech', 'sponsorship',
  'shipping company', 'salary', 'rank', 'captain', 'chief engineer',
  'navigating officer', 'watchkeeping', 'stcw', 'coc', 'meo', 'mmd',
  'eligibility', 'college', 'mti', 'course',
]

export const INJECTION_PATTERNS = [
  'ignore previous', 'ignore all', 'you are now', 'new instructions',
  'disregard', 'act as', 'pretend you are', 'forget everything',
  'system prompt', 'jailbreak', 'dan', 'developer mode',
]

const ELIGIBILITY_KEYWORDS = [
  'eligible', 'qualify', 'can i join', 'my marks', 'my age',
  'my percentage', 'do i qualify',
]

const FACTUAL_KEYWORDS = [
  'age limit', 'fees', 'duration', 'salary', 'what is', 'how long',
  'which course',
]

export function containsInjection(message: string): boolean {
  const lower = message.toLowerCase()
  return INJECTION_PATTERNS.some((p) => lower.includes(p))
}

export function isMritimeRelated(message: string): boolean {
  const lower = message.toLowerCase()
  return MARITIME_KEYWORDS.some((k) => lower.includes(k))
}

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase()

  if (containsInjection(message)) return 'out_of_scope'

  if (ELIGIBILITY_KEYWORDS.some((k) => lower.includes(k))) return 'eligibility_query'

  if (FACTUAL_KEYWORDS.some((k) => lower.includes(k)) && isMritimeRelated(message)) {
    return 'factual_lookup'
  }

  if (isMritimeRelated(message)) return 'conversational'

  return 'out_of_scope'
}
