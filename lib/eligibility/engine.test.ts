import {
  calculateAgeAtCourseStart,
  calculateMaxAge,
  calculateMinEnglishRequired,
  checkCourseEligibility,
  runEligibilityCheck,
  getNextCourseStartDate,
  COURSE_RULES,
  type UserProfile,
} from './engine'

// Helper: Build a DOB such that the person is `yearsOld` on the given date
function dobAtAge(yearsOld: number, atDate: Date): Date {
  const d = new Date(atDate)
  d.setFullYear(d.getFullYear() - yearsOld)
  return d
}

// Fixed course start for deterministic tests
const COURSE_START = new Date(2026, 7, 1) // August 1, 2026

function base12Profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    qualification: 'class_12',
    dateOfBirth: dobAtAge(18, COURSE_START),
    gender: 'male',
    category: 'general',
    isIslandStNative: false,
    pcmAverage: 65,
    physicsPercentage: 65,
    chemistryPercentage: 65,
    mathsPercentage: 65,
    englishPercentage10th: 55,
    englishPercentage12th: 55,
    diplomaPercentage: 0,
    diplomaMediumEnglish: false,
    degreePercentage: 0,
    degreeMediumEnglish: false,
    degreeField: '',
    state: 'Maharashtra',
    ...overrides,
  }
}

function baseGradProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    qualification: 'engineering_grad',
    dateOfBirth: dobAtAge(25, COURSE_START),
    gender: 'male',
    category: 'general',
    isIslandStNative: false,
    pcmAverage: 0,
    physicsPercentage: 0,
    chemistryPercentage: 0,
    mathsPercentage: 0,
    englishPercentage10th: 55,
    englishPercentage12th: 55,
    diplomaPercentage: 0,
    diplomaMediumEnglish: false,
    degreePercentage: 55,
    degreeMediumEnglish: true,
    degreeField: 'mechanical engineering',
    state: 'Maharashtra',
    ...overrides,
  }
}

function base10Profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    qualification: 'class_10',
    dateOfBirth: dobAtAge(18, COURSE_START),
    gender: 'male',
    category: 'general',
    isIslandStNative: false,
    pcmAverage: 0,
    physicsPercentage: 0,
    chemistryPercentage: 0,
    mathsPercentage: 0,
    englishPercentage10th: 42,
    englishPercentage12th: 0,
    diplomaPercentage: 45,
    diplomaMediumEnglish: false,
    degreePercentage: 0,
    degreeMediumEnglish: false,
    degreeField: '',
    state: 'Maharashtra',
    ...overrides,
  }
}

const bscRules = COURSE_RULES.find((c) => c.courseId === 'bsc-nautical-science')!.routes
const gmeRules = COURSE_RULES.find((c) => c.courseId === 'graduate-marine-engineering')!.routes
const etoRules = COURSE_RULES.find((c) => c.courseId === 'electro-technical-officer')!.routes
const gpRules = COURSE_RULES.find((c) => c.courseId === 'gp-rating')!.routes

// ── GROUP 1 — Age Calculation ─────────────────────────────────────────────────

describe('Group 1 — Age Calculation', () => {
  test('age is calculated at course start, not today', () => {
    const today = new Date()
    const dob = dobAtAge(17, today)
    const courseStart = getNextCourseStartDate(today)
    const age = calculateAgeAtCourseStart(dob, courseStart)
    expect(age).toBeGreaterThan(17)
    expect(age).toBeLessThan(18.5)
  })

  test('SC male base 25: max age = 30', () => {
    expect(calculateMaxAge(25, 'sc', 'male')).toBe(30)
  })

  test('ST female base 25: max age = 32', () => {
    expect(calculateMaxAge(25, 'st', 'female')).toBe(32)
  })

  test('OBC female base 25: max age = 30', () => {
    expect(calculateMaxAge(25, 'obc_ncl', 'female')).toBe(30)
  })

  test('General female base 25: max age = 27', () => {
    expect(calculateMaxAge(25, 'general', 'female')).toBe(27)
  })

  test('General male base 25: max age = 25', () => {
    expect(calculateMaxAge(25, 'general', 'male')).toBe(25)
  })
})

// ── GROUP 2 — B.Sc. Nautical Science ─────────────────────────────────────────

describe('Group 2 — B.Sc. Nautical Science', () => {
  const check = (p: UserProfile) =>
    checkCourseEligibility(p, bscRules, 'bsc-nautical-science', 'B.Sc. (Nautical Science)', 'bsc-nautical-science', COURSE_START)

  test('PCM 65%, English 55%, age 18, General Male → ELIGIBLE', () => {
    expect(check(base12Profile()).status).toBe('eligible')
  })

  test('PCM 62%, English 55%, age 18, General Male → BORDERLINE (PCM 2% below 60 — but 62>60, so ELIGIBLE)', () => {
    // PCM 62 is above 60, so ELIGIBLE
    expect(check(base12Profile({ pcmAverage: 62 })).status).toBe('eligible')
  })

  test('PCM 65%, English 45%, age 18, General Male → NOT ELIGIBLE (English 45% fails both 10th and 12th)', () => {
    const r = check(base12Profile({ englishPercentage10th: 45, englishPercentage12th: 45 }))
    expect(r.status).toBe('not_eligible')
  })

  test('PCM 62%, English 48%, age 18, General Male → NOT ELIGIBLE (English fails both 10th and 12th)', () => {
    const r = check(base12Profile({ pcmAverage: 62, englishPercentage10th: 48, englishPercentage12th: 48 }))
    expect(r.status).toBe('not_eligible')
  })

  test('PCM 65%, English 52% in 10th only, age 18 → ELIGIBLE (either rule)', () => {
    const r = check(base12Profile({ englishPercentage10th: 52, englishPercentage12th: 0 }))
    expect(r.status).toBe('eligible')
  })

  test('PCM 65%, English 55%, age 26, General Male → NOT ELIGIBLE (over age 25)', () => {
    const r = check(base12Profile({ dateOfBirth: dobAtAge(26, COURSE_START) }))
    expect(r.status).toBe('not_eligible')
  })

  test('PCM 65%, English 55%, age 26, ST Male → ELIGIBLE (age 26 < max 30)', () => {
    const r = check(base12Profile({ category: 'st', dateOfBirth: dobAtAge(26, COURSE_START) }))
    expect(r.status).toBe('eligible')
  })

  test('PCM 65%, English 55%, age 28, ST Female → ELIGIBLE (age 28 < max 32)', () => {
    const r = check(base12Profile({ category: 'st', gender: 'female', dateOfBirth: dobAtAge(28, COURSE_START) }))
    expect(r.status).toBe('eligible')
  })

  test('PCM 58%, English 55%, age 18 → BORDERLINE (PCM 2% below 60%)', () => {
    const r = check(base12Profile({ pcmAverage: 58 }))
    expect(r.status).toBe('borderline')
  })
})

// ── GROUP 3 — GME ─────────────────────────────────────────────────────────────

describe('Group 3 — GME', () => {
  const check = (p: UserProfile) =>
    checkCourseEligibility(p, gmeRules, 'graduate-marine-engineering', 'Graduate Marine Engineering (GME)', 'graduate-marine-engineering', COURSE_START)

  test('B.Tech Mechanical 55%, English 55%, age 25, General → ELIGIBLE', () => {
    expect(check(baseGradProfile()).status).toBe('eligible')
  })

  test('B.Tech Mechanical 45%, English 55%, age 25 → NOT ELIGIBLE (below 50%)', () => {
    const r = check(baseGradProfile({ degreePercentage: 45 }))
    expect(r.status).toBe('not_eligible')
  })

  test('B.Tech Electrical 55%, English 55%, age 25 → NOT ELIGIBLE (wrong degree for all routes)', () => {
    const r = check(baseGradProfile({ degreeField: 'electrical engineering' }))
    expect(r.status).toBe('not_eligible')
  })

  test('B.Tech Mechanical 55%, age 30, General → NOT ELIGIBLE (over 28)', () => {
    const r = check(baseGradProfile({ dateOfBirth: dobAtAge(30, COURSE_START) }))
    expect(r.status).toBe('not_eligible')
  })

  test('B.Tech Mechanical 55%, age 30, ST Male → ELIGIBLE (30 < 33)', () => {
    const r = check(baseGradProfile({ category: 'st', dateOfBirth: dobAtAge(30, COURSE_START) }))
    expect(r.status).toBe('eligible')
  })
})

// ── GROUP 4 — ETO ─────────────────────────────────────────────────────────────

describe('Group 4 — ETO', () => {
  const check = (p: UserProfile) =>
    checkCourseEligibility(p, etoRules, 'electro-technical-officer', 'Electro-Technical Officers (ETO)', 'electro-technical-officer', COURSE_START)

  test('B.Tech Electronics 55%, English 55%, age 30 → ELIGIBLE', () => {
    const r = check(baseGradProfile({
      degreeField: 'electronics engineering',
      dateOfBirth: dobAtAge(30, COURSE_START),
    }))
    expect(r.status).toBe('eligible')
  })

  test('B.Tech Electronics 55%, English 45% in school but 55% in degree, medium English → ELIGIBLE', () => {
    const r = check(baseGradProfile({
      degreeField: 'electronics engineering',
      englishPercentage10th: 45,
      englishPercentage12th: 45,
      degreePercentage: 55,
      degreeMediumEnglish: true,
    }))
    expect(r.status).toBe('eligible')
  })

  test('Age 36, General → NOT ELIGIBLE (over 35)', () => {
    const r = check(baseGradProfile({
      degreeField: 'electronics engineering',
      dateOfBirth: dobAtAge(36, COURSE_START),
    }))
    expect(r.status).toBe('not_eligible')
  })

  test('Age 36, ST → ELIGIBLE (36 < 40)', () => {
    const r = check(baseGradProfile({
      degreeField: 'electronics engineering',
      category: 'st',
      dateOfBirth: dobAtAge(36, COURSE_START),
    }))
    expect(r.status).toBe('eligible')
  })
})

// ── GROUP 5 — GP Rating ───────────────────────────────────────────────────────

describe('Group 5 — GP Rating', () => {
  const check = (p: UserProfile) =>
    checkCourseEligibility(p, gpRules, 'gp-rating', 'General Purpose Rating (GP Rating)', 'gp-rating', COURSE_START)

  test('Class 10, 45% aggregate, Science + Maths, English 42%, age 18 → ELIGIBLE', () => {
    const r = check(base10Profile({ diplomaPercentage: 45, englishPercentage10th: 42 }))
    expect(r.status).toBe('eligible')
  })

  test('Class 10, 35% aggregate → NOT ELIGIBLE (below 40%)', () => {
    const r = check(base10Profile({ diplomaPercentage: 35 }))
    expect(r.status).toBe('not_eligible')
  })

  test('Class 10, 45% aggregate, English 35% → NOT ELIGIBLE (English below 40%)', () => {
    const r = check(base10Profile({ diplomaPercentage: 45, englishPercentage10th: 35 }))
    expect(r.status).toBe('not_eligible')
  })

  test('Age 17, Class 10 → NOT ELIGIBLE (below minimum age 17.5)', () => {
    const r = check(base10Profile({ dateOfBirth: dobAtAge(17, COURSE_START) }))
    expect(r.status).toBe('not_eligible')
  })

  test('Age 26, Class 10, General → NOT ELIGIBLE (over 25)', () => {
    const r = check(base10Profile({ dateOfBirth: dobAtAge(26, COURSE_START) }))
    expect(r.status).toBe('not_eligible')
  })
})

// ── GROUP 6 — Island ST Native ────────────────────────────────────────────────

describe('Group 6 — Island ST Native', () => {
  const check = (p: UserProfile) =>
    checkCourseEligibility(p, bscRules, 'bsc-nautical-science', 'B.Sc. (Nautical Science)', 'bsc-nautical-science', COURSE_START)

  test('English 47%, isIslandStNative true → ELIGIBLE (47% >= adjusted 45%)', () => {
    const r = check(base12Profile({
      category: 'st',
      isIslandStNative: true,
      englishPercentage10th: 47,
      englishPercentage12th: 47,
    }))
    expect(r.status).toBe('eligible')
  })

  test('English 44%, isIslandStNative true → NOT ELIGIBLE (44% < adjusted 45%)', () => {
    const r = check(base12Profile({
      category: 'st',
      isIslandStNative: true,
      englishPercentage10th: 44,
      englishPercentage12th: 44,
    }))
    expect(r.status).toBe('not_eligible')
  })
})

// ── GROUP 7 — Full report ─────────────────────────────────────────────────────

describe('Group 7 — Full eligibility report', () => {
  test('Strong class 12 profile has positive eligibility score', () => {
    const report = runEligibilityCheck(base12Profile(), COURSE_RULES)
    expect(report.eligibilityScore).toBeGreaterThan(0)
    expect(report.eligibleCourses.length).toBeGreaterThan(0)
    expect(report.topRecommendation).not.toBeNull()
  })

  test('calculateMinEnglishRequired reduces by 5 for island ST native', () => {
    expect(calculateMinEnglishRequired(50, true)).toBe(45)
    expect(calculateMinEnglishRequired(50, false)).toBe(50)
  })
})
