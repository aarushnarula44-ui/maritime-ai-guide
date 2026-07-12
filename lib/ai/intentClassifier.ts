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

export const CREATOR_PATTERNS = [
  'who made you', 'who created you', 'who built you', 'who developed you',
  'who made this', 'who built this', 'who created this', 'who developed this',
  'who made maritime ai guide', 'who built maritime ai guide', 'who created maritime ai guide',
  'who is your creator', 'your creator', 'your developer', 'your maker',
  'what ai model are you', 'which ai model are you', 'what model are you', 'which model are you',
  'are you chatgpt', 'are you gpt', 'are you openai', 'are you gemini', 'are you claude',
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

export function containsCreatorQuestion(message: string): boolean {
  const lower = message.toLowerCase()
  return CREATOR_PATTERNS.some((p) => lower.includes(p))
}

export function isMaritimeRelated(message: string): boolean {
  const lower = message.toLowerCase()
  return MARITIME_KEYWORDS.some((k) => lower.includes(k))
}

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase()

  if (containsInjection(message)) return 'out_of_scope'

  if (ELIGIBILITY_KEYWORDS.some((k) => lower.includes(k))) return 'eligibility_query'

  if (FACTUAL_KEYWORDS.some((k) => lower.includes(k)) && isMaritimeRelated(message)) {
    return 'factual_lookup'
  }

  if (isMaritimeRelated(message)) return 'conversational'

  return 'out_of_scope'
}
