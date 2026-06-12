import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runEligibilityCheck, COURSE_RULES, type UserProfile } from '@/lib/eligibility/engine'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

// ── Zod schema ────────────────────────────────────────────────────────────────

const ProfileSchema = z.object({
  qualification: z.enum(['class_10', 'class_11', 'class_12', 'diploma', 'engineering_grad', 'bsc_grad', 'other_grad']),
  dateOfBirth: z.string().refine((v) => {
    const d = new Date(v)
    if (isNaN(d.getTime())) return false
    const ageMs = Date.now() - d.getTime()
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)
    return ageYears >= 15
  }, { message: 'Date of birth must be a valid date and person must be at least 15 years old' }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  category: z.enum(['general', 'sc', 'st', 'obc_ncl', 'ews']),
  isIslandStNative: z.boolean().optional().default(false),
  pcmAverage: z.number().min(0).max(100).optional().default(0),
  physicsPercentage: z.number().min(0).max(100).optional().default(0),
  chemistryPercentage: z.number().min(0).max(100).optional().default(0),
  mathsPercentage: z.number().min(0).max(100).optional().default(0),
  englishPercentage10th: z.number().min(0).max(100).optional().default(0),
  englishPercentage12th: z.number().min(0).max(100).optional().default(0),
  diplomaPercentage: z.number().min(0).max(100).optional().default(0),
  diplomaMediumEnglish: z.boolean().optional().default(false),
  degreePercentage: z.number().min(0).max(100).optional().default(0),
  degreeMediumEnglish: z.boolean().optional().default(false),
  degreeField: z.string().optional().default(''),
  state: z.string().optional().default(''),
})

// ── In-memory rate limiter (falls back from Vercel KV) ───────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + window })
    return { allowed: true, retryAfter: 0 }
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count += 1
  return { allowed: true, retryAfter: 0 }
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitKey = user ? `user:${user.id}` : `ip:${ip}`
  const maxRequests = user ? 20 : 5
  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, maxRequests)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const data = parsed.data
  const profile: UserProfile = {
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
  }

  // Run eligibility engine
  const report = runEligibilityCheck(profile, COURSE_RULES, user?.id ?? null)

  // Persist for authenticated users
  if (user) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('eligibility_checks').insert({
        user_id: user.id,
        eligibility_score: report.eligibilityScore,
        eligible_course_ids: report.eligibleCourses.map((c) => c.courseId),
        borderline_course_ids: report.borderlineCourses.map((c) => c.courseId),
        profile_snapshot: profile as unknown as Record<string, unknown>,
        generated_at: report.generatedAt.toISOString(),
      })
    } catch {
      // Non-fatal: table may not exist yet or RLS may block
    }
  }

  return NextResponse.json(report)
}
