// DGS Training Circular No. 12 of 2020 — Eligibility Engine
// This file is pure TypeScript with zero API calls. All rules hardcoded from the circular.

export type Qualification =
  | 'class_10'
  | 'class_11'
  | 'class_12'
  | 'diploma'
  | 'engineering_grad'
  | 'bsc_grad'
  | 'other_grad'

export interface UserProfile {
  qualification: Qualification
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  category: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews'
  isIslandStNative: boolean
  pcmAverage: number
  physicsPercentage: number
  chemistryPercentage: number
  mathsPercentage: number
  englishPercentage10th: number
  englishPercentage12th: number
  diplomaPercentage: number
  diplomaMediumEnglish: boolean
  degreePercentage: number
  degreeMediumEnglish: boolean
  degreeField: string
  state: string
}

export interface Gap {
  field: string
  currentValue: number
  requiredValue: number
  difference: number
  message: string
}

export interface EligibilityResult {
  courseId: string
  courseName: string
  courseSlug: string
  status: 'eligible' | 'borderline' | 'not_eligible'
  matchedRoute: number | null
  routeLabel: string | null
  reasons: string[]
  gaps: Gap[]
  ageAtCourseStart: number
  maxAgeForUser: number
}

export interface EligibilityReport {
  userId: string | null
  profile: UserProfile
  courseStartDate: Date
  eligibleCourses: EligibilityResult[]
  borderlineCourses: EligibilityResult[]
  notEligibleCourses: EligibilityResult[]
  eligibilityScore: number
  topRecommendation: EligibilityResult | null
  generatedAt: Date
}

interface EligibilityRule {
  routeNumber: number
  routeLabel: string
  qualificationRequired: string
  minPcmPercentage?: number
  minAggregatePercentage?: number
  minEnglishPercentage: number
  englishCheckLevel: string
  minAge?: number
  maxAgeGeneral: number
  additionalConditions?: Record<string, unknown>
  exemptionsGranted?: Record<string, boolean>
  sourceSection: string
}

export interface CourseWithRules {
  courseId: string
  courseName: string
  courseSlug: string
  department: string
  routes: EligibilityRule[]
}

interface RouteEligibilityResult {
  routeNumber: number
  routeLabel: string
  status: 'eligible' | 'borderline' | 'not_eligible'
  reasons: string[]
  gaps: Gap[]
  ageAtCourseStart: number
  maxAgeForUser: number
}

// ── Age utilities ─────────────────────────────────────────────────────────────

export function getNextCourseStartDate(from: Date = new Date()): Date {
  const year = from.getFullYear()
  const aug1ThisYear = new Date(year, 7, 1)
  return from < aug1ThisYear ? aug1ThisYear : new Date(year + 1, 7, 1)
}

export function calculateAgeAtCourseStart(dateOfBirth: Date, courseStartDate: Date): number {
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25
  return (courseStartDate.getTime() - dateOfBirth.getTime()) / msPerYear
}

export function calculateMaxAge(baseMaxAge: number, category: string, gender: string): number {
  let relaxation = 0
  if (category === 'sc' || category === 'st') relaxation += 5
  else if (category === 'obc_ncl') relaxation += 3
  if (gender === 'female') relaxation += 2
  return baseMaxAge + relaxation
}

export function calculateMinEnglishRequired(baseRequired: number, isIslandStNative: boolean): number {
  return isIslandStNative ? baseRequired - 5 : baseRequired
}

// ── English eligibility ───────────────────────────────────────────────────────

export function checkEnglishEligibility(
  profile: UserProfile,
  requiredPct: number,
  checkLevel: string
): boolean {
  switch (checkLevel) {
    case 'class_10':
      return profile.englishPercentage10th >= requiredPct
    case 'class_12':
      return profile.englishPercentage12th >= requiredPct
    case 'either':
      return profile.englishPercentage10th >= requiredPct || profile.englishPercentage12th >= requiredPct
    case 'degree':
      return profile.degreeMediumEnglish && profile.degreePercentage >= requiredPct
    case 'diploma_or_degree':
      return (
        (profile.diplomaMediumEnglish && profile.diplomaPercentage >= requiredPct) ||
        (profile.degreeMediumEnglish && profile.degreePercentage >= requiredPct)
      )
    default:
      return false
  }
}

// ── Qualification matching ────────────────────────────────────────────────────

function qualificationMeetsRequirement(userQual: Qualification, required: string): boolean {
  const userRank: Record<Qualification, number> = {
    class_10: 1,
    class_11: 1,
    class_12: 2,
    diploma: 3,
    bsc_grad: 4,
    engineering_grad: 4,
    other_grad: 4,
  }
  const reqRank: Record<string, number> = {
    class_10: 1,
    class_12_pcm: 2,
    diploma: 3,
    bsc: 4,
    be_btech: 4,
    engineering_grad: 4,
  }
  return (userRank[userQual] ?? 0) >= (reqRank[required] ?? 999)
}

// ── Degree field matching ─────────────────────────────────────────────────────

function degreeFieldMatches(degreeField: string, requiredField: string): boolean {
  const f = degreeField.toLowerCase()
  switch (requiredField) {
    case 'mechanical_engineering':
      return f.includes('mechanical') && !f.includes('auto') && !f.includes('electronics')
    case 'mechanical_streams':
      return (
        f.includes('mechanical') &&
        (f.includes('auto') || f.includes('electronic') || f.includes('mechatronics'))
      )
    case 'naval_architecture':
      return f.includes('naval')
    default:
      return false
  }
}

function degreeStreamMatchesETO(degreeField: string): boolean {
  const f = degreeField.toLowerCase()
  return (
    f.includes('electrical') ||
    f.includes('electronics') ||
    f.includes('telecommunication') ||
    f.includes('instrumentation')
  )
}

// ── Gap helpers ───────────────────────────────────────────────────────────────

// Strictly less than 5 — equal gap is a hard failure
const BORDERLINE_THRESHOLD = 5

function isBorderline(current: number, required: number): boolean {
  return current < required && required - current < BORDERLINE_THRESHOLD
}

function makeGap(field: string, current: number, required: number, message: string): Gap {
  return { field, currentValue: current, requiredValue: required, difference: required - current, message }
}

// ── Route eligibility check ───────────────────────────────────────────────────

export function checkRouteEligibility(
  profile: UserProfile,
  rule: EligibilityRule,
  courseStartDate: Date
): RouteEligibilityResult {
  const reasons: string[] = []
  const gaps: Gap[] = []
  const failures: string[] = []

  const age = calculateAgeAtCourseStart(profile.dateOfBirth, courseStartDate)
  const maxAge = calculateMaxAge(rule.maxAgeGeneral, profile.category, profile.gender)
  const minEnglish = calculateMinEnglishRequired(rule.minEnglishPercentage, profile.isIslandStNative)
  const englishPasses = checkEnglishEligibility(profile, minEnglish, rule.englishCheckLevel)

  // ─ Qualification check ─
  if (!qualificationMeetsRequirement(profile.qualification, rule.qualificationRequired)) {
    const qualLabels: Record<string, string> = {
      class_10: 'Class 10',
      class_12_pcm: 'Class 12 (PCM)',
      diploma: 'Diploma',
      bsc: 'B.Sc.',
      be_btech: 'B.E./B.Tech.',
      engineering_grad: 'Engineering Degree',
    }
    failures.push(`Qualification required: ${qualLabels[rule.qualificationRequired] ?? rule.qualificationRequired}`)
  }

  // ─ PCM check (Class 12 routes) ─
  if (rule.minPcmPercentage !== undefined && profile.qualification === 'class_12') {
    if (profile.pcmAverage < rule.minPcmPercentage) {
      if (isBorderline(profile.pcmAverage, rule.minPcmPercentage)) {
        gaps.push(makeGap('PCM Average', profile.pcmAverage, rule.minPcmPercentage,
          `You need ${(rule.minPcmPercentage - profile.pcmAverage).toFixed(1)}% more in PCM (currently ${profile.pcmAverage.toFixed(1)}%, need ${rule.minPcmPercentage}%)`))
      } else {
        failures.push(`PCM average ${profile.pcmAverage.toFixed(1)}% is below required ${rule.minPcmPercentage}%`)
      }
    } else {
      reasons.push(`PCM ${profile.pcmAverage.toFixed(1)}% (minimum ${rule.minPcmPercentage}%)`)
    }
  }

  // ─ Aggregate check (diploma/degree routes) ─
  if (rule.minAggregatePercentage !== undefined) {
    let aggregate = 0
    let aggLabel = ''
    if (profile.qualification === 'class_10' || profile.qualification === 'class_11') {
      // diplomaPercentage is reused to carry the class 10 overall aggregate
      aggregate = profile.diplomaPercentage
      aggLabel = 'Class 10 aggregate'
    } else if (profile.qualification === 'diploma') {
      aggregate = profile.diplomaPercentage
      aggLabel = 'Diploma aggregate'
    } else if (profile.qualification === 'engineering_grad' || profile.qualification === 'bsc_grad') {
      aggregate = profile.degreePercentage
      aggLabel = 'Degree aggregate'
    }
    if (aggLabel) {
      if (aggregate < rule.minAggregatePercentage) {
        if (isBorderline(aggregate, rule.minAggregatePercentage)) {
          gaps.push(makeGap(aggLabel, aggregate, rule.minAggregatePercentage,
            `You need ${(rule.minAggregatePercentage - aggregate).toFixed(1)}% more in ${aggLabel.toLowerCase()} (currently ${aggregate.toFixed(1)}%, need ${rule.minAggregatePercentage}%)`))
        } else {
          failures.push(`${aggLabel} ${aggregate.toFixed(1)}% is below required ${rule.minAggregatePercentage}%`)
        }
      } else {
        reasons.push(`${aggLabel} ${aggregate.toFixed(1)}% (minimum ${rule.minAggregatePercentage}%)`)
      }
    }
  }

  // ─ English check — always a hard requirement, never borderline ─
  const conds = rule.additionalConditions as Record<string, unknown> | undefined
  const etoBestEnglishPasses =
    conds?.englishAlternative &&
    (profile.degreeMediumEnglish
      ? profile.degreePercentage >= 50
      : profile.diplomaMediumEnglish
        ? profile.diplomaPercentage >= 60
        : false)

  if (!englishPasses && !etoBestEnglishPasses) {
    const e10 = profile.englishPercentage10th
    const e12 = profile.englishPercentage12th
    const best = Math.max(e10, e12)
    failures.push(`English ${best.toFixed(1)}% is below required ${minEnglish}% (checked in 10th and 12th)`)
  } else if (englishPasses || etoBestEnglishPasses) {
    reasons.push(`English ${Math.max(profile.englishPercentage10th, profile.englishPercentage12th).toFixed(1)}% (minimum ${minEnglish}%)`)
  }

  // ─ Degree field check (GME, ETO) ─
  if (conds?.degreeField && typeof conds.degreeField === 'string') {
    const reqField = conds.degreeField as string
    if (!degreeFieldMatches(profile.degreeField, reqField)) {
      failures.push(`Degree field "${profile.degreeField}" does not match required: ${reqField.replace(/_/g, ' ')}`)
    }
  }
  if (conds?.degreeStreams && profile.qualification === 'engineering_grad') {
    if (!degreeStreamMatchesETO(profile.degreeField)) {
      failures.push(`Degree field "${profile.degreeField}" is not in the required streams for ETO (electrical/electronics etc.)`)
    } else {
      reasons.push(`Degree in ${profile.degreeField} qualifies for ETO`)
    }
  }

  // ─ Minimum age check ─
  if (rule.minAge !== undefined && age < rule.minAge) {
    failures.push(`Minimum age is ${rule.minAge} years (you will be ${age.toFixed(1)} years at course start)`)
  } else if (rule.minAge !== undefined) {
    reasons.push(`Age ${age.toFixed(1)} years meets minimum of ${rule.minAge} years`)
  }

  // ─ Maximum age check ─
  if (age > maxAge) {
    failures.push(`Age ${age.toFixed(1)} years exceeds maximum ${maxAge} years for your category/gender`)
  } else {
    reasons.push(`Age ${age.toFixed(1)} years (maximum ${maxAge} years)`)
  }

  // ─ Determine status ─
  const hasHardFailure = failures.length > 0
  const hasBorderlineGap = gaps.length > 0

  let status: 'eligible' | 'borderline' | 'not_eligible'
  if (hasHardFailure) {
    status = 'not_eligible'
    reasons.push(...failures)
  } else if (hasBorderlineGap) {
    status = 'borderline'
  } else {
    status = 'eligible'
  }

  return { routeNumber: rule.routeNumber, routeLabel: rule.routeLabel, status, reasons, gaps, ageAtCourseStart: age, maxAgeForUser: maxAge }
}

// ── Course eligibility check ──────────────────────────────────────────────────

export function checkCourseEligibility(
  profile: UserProfile,
  courseRules: EligibilityRule[],
  courseId: string,
  courseName: string,
  courseSlug: string,
  courseStartDate: Date
): EligibilityResult {
  const routeResults = courseRules.map((rule) => checkRouteEligibility(profile, rule, courseStartDate))

  const eligible = routeResults.find((r) => r.status === 'eligible')
  if (eligible) {
    return {
      courseId, courseName, courseSlug,
      status: 'eligible',
      matchedRoute: eligible.routeNumber,
      routeLabel: eligible.routeLabel,
      reasons: eligible.reasons,
      gaps: [],
      ageAtCourseStart: eligible.ageAtCourseStart,
      maxAgeForUser: eligible.maxAgeForUser,
    }
  }

  const borderline = routeResults.find((r) => r.status === 'borderline')
  if (borderline) {
    return {
      courseId, courseName, courseSlug,
      status: 'borderline',
      matchedRoute: borderline.routeNumber,
      routeLabel: borderline.routeLabel,
      reasons: borderline.reasons,
      gaps: borderline.gaps,
      ageAtCourseStart: borderline.ageAtCourseStart,
      maxAgeForUser: borderline.maxAgeForUser,
    }
  }

  // All not_eligible — return the best (fewest failures) route's details
  const best = routeResults[0]
  return {
    courseId, courseName, courseSlug,
    status: 'not_eligible',
    matchedRoute: null,
    routeLabel: null,
    reasons: best.reasons,
    gaps: [],
    ageAtCourseStart: best.ageAtCourseStart,
    maxAgeForUser: best.maxAgeForUser,
  }
}

// ── Full eligibility report ───────────────────────────────────────────────────

export function runEligibilityCheck(
  profile: UserProfile,
  allCourseRules: CourseWithRules[],
  userId: string | null = null
): EligibilityReport {
  const courseStartDate = getNextCourseStartDate()
  const results = allCourseRules.map((course) =>
    checkCourseEligibility(profile, course.routes, course.courseId, course.courseName, course.courseSlug, courseStartDate)
  )

  const eligibleCourses = results.filter((r) => r.status === 'eligible')
  const borderlineCourses = results.filter((r) => r.status === 'borderline')
  const notEligibleCourses = results.filter((r) => r.status === 'not_eligible')

  const officerCourseIds = new Set(['bsc-nautical-science', 'dns-diploma-nautical-science', 'be-btech-marine-engineering', 'graduate-marine-engineering', 'electro-technical-officer'])
  const technicalCourseIds = new Set(['diploma-marine-engineering'])
  const ratingCourseIds = new Set(['gp-rating', 'maritime-catering-ccmc'])

  const eligibleOfficer = eligibleCourses.filter((r) => officerCourseIds.has(r.courseId)).length
  const eligibleTechnical = eligibleCourses.filter((r) => technicalCourseIds.has(r.courseId)).length
  const eligibleRatings = eligibleCourses.filter((r) => ratingCourseIds.has(r.courseId)).length

  let eligibilityScore: number
  if (eligibleOfficer >= 3) eligibilityScore = 100
  else if (eligibleOfficer >= 1) eligibilityScore = 80
  else if (eligibleTechnical > 0) eligibilityScore = 60
  else if (eligibleRatings > 0) eligibilityScore = 40
  else if (borderlineCourses.length > 0) eligibilityScore = 20
  else eligibilityScore = 0

  // Top recommendation: prefer officer courses, then by route label
  const topRecommendation =
    eligibleCourses.find((r) => officerCourseIds.has(r.courseId)) ??
    eligibleCourses[0] ??
    borderlineCourses[0] ??
    null

  return {
    userId,
    profile,
    courseStartDate,
    eligibleCourses,
    borderlineCourses,
    notEligibleCourses,
    eligibilityScore,
    topRecommendation,
    generatedAt: new Date(),
  }
}

// ── Hardcoded DGS TC 12/2020 rules ───────────────────────────────────────────

export const COURSE_RULES: CourseWithRules[] = [
  {
    courseId: 'bsc-nautical-science',
    courseName: 'B.Sc. (Nautical Science)',
    courseSlug: 'bsc-nautical-science',
    department: 'deck',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — 12th Standard',
        qualificationRequired: 'class_12_pcm',
        minPcmPercentage: 60,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        sourceSection: 'Annexure 1, Page 1',
      },
    ],
  },
  {
    courseId: 'dns-diploma-nautical-science',
    courseName: 'Diploma in Nautical Science (DNS)',
    courseSlug: 'dns-diploma-nautical-science',
    department: 'deck',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — 12th Standard',
        qualificationRequired: 'class_12_pcm',
        minPcmPercentage: 60,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        sourceSection: 'Annexure 1, Page 2',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — B.Sc. Graduate',
        qualificationRequired: 'bsc',
        minAggregatePercentage: 55,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: {
          bscSubjects: ['physics', 'mathematics', 'chemistry', 'electronics'],
          physicsRequired: true,
        },
        sourceSection: 'Annexure 1, Page 2',
      },
      {
        routeNumber: 3,
        routeLabel: 'Route C — B.E./B.Tech Graduate',
        qualificationRequired: 'be_btech',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: { instituteTypes: ['iit', 'aicte_recognized'] },
        sourceSection: 'Annexure 1, Page 2',
      },
    ],
  },
  {
    courseId: 'be-btech-marine-engineering',
    courseName: 'BE/B-Tech Marine Engineering',
    courseSlug: 'be-btech-marine-engineering',
    department: 'engine',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — 12th Standard',
        qualificationRequired: 'class_12_pcm',
        minPcmPercentage: 60,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        exemptionsGranted: { meoClassIVPartA: true, meoClassIIPartA: true },
        sourceSection: 'Annexure 1, Page 3',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — Alternate Training Scheme',
        qualificationRequired: 'diploma',
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: { alternateTrainingScheme: true, notApplicableToMERI: true },
        sourceSection: 'Annexure 1, Page 3',
      },
      {
        routeNumber: 3,
        routeLabel: 'Route C — Engineering 1st Year',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 60,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: { streams: ['mechanical', 'electrical'], aicteApproved: true, lateralEntry2ndYear: true },
        sourceSection: 'Annexure 1, Page 3',
      },
      {
        routeNumber: 4,
        routeLabel: 'Route D — 3-Year Diploma Mechanical/Marine/Electrical',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 55,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: {
          diplomaStreams: ['mechanical', 'marine', 'electrical', 'electrical_electronics'],
          aicteOrStateboard: true,
          lateralEntry2ndYear: true,
        },
        exemptionsGranted: { meoClassIVPartA: true, meoClassIIPartA: true },
        sourceSection: 'Annexure 1, Page 3-4',
      },
      {
        routeNumber: 5,
        routeLabel: 'Route E — 3-Year Diploma Specific Streams',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 55,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: {
          diplomaStreams: [
            'automobile', 'machine_tools_maintenance', 'plant_engineering',
            'production_technology', 'production_engineering', 'tool_die_making',
            'electrical_power_system', 'digital_electronics', 'electronics_communications',
            'electronics_telecommunication', 'industrial_electronics', 'electronics',
            'electronics_production_maintenance', 'instrumentation', 'instrumentation_control',
          ],
          aicteOrStateboard: true,
          lateralEntry2ndYear: true,
          noExemptionAppliedMechanics: true,
        },
        sourceSection: 'Annexure 1, Page 5-7',
      },
      {
        routeNumber: 6,
        routeLabel: 'Route F — 4-Year Diploma Shipbuilding',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 55,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 25,
        additionalConditions: {
          diplomaStreams: ['shipbuilding_engineering'],
          duration4Years: true,
          aicteOrStateboard: true,
          lateralEntry2ndYear: true,
        },
        exemptionsGranted: { meoClassIVPartA: true, meoClassIIPartA: true },
        sourceSection: 'Annexure 1, Page 6',
      },
    ],
  },
  {
    courseId: 'graduate-marine-engineering',
    courseName: 'Graduate Marine Engineering (GME)',
    courseSlug: 'graduate-marine-engineering',
    department: 'engine',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — Mechanical Engineering Degree',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 28,
        additionalConditions: {
          degreeField: 'mechanical_engineering',
          instituteTypes: ['aicte', 'iit', 'university_engineering'],
          exactMechanical: true,
        },
        exemptionsGranted: { meoClassIVPartA: true, meoClassIIPartA: true },
        sourceSection: 'Annexure 1, Page 8',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — Mechanical Engineering Streams',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 28,
        additionalConditions: {
          degreeField: 'mechanical_streams',
          mechanicalMustBeFirst: true,
          streams: ['mechanical_automation', 'mechanical_electronics', 'mechanical_automobile'],
          instituteTypes: ['aicte', 'iit', 'university_engineering'],
        },
        exemptionsGranted: { meoClassIVPartA: false, meoClassIIPartA: false, mathsAppliedMechanicsExemption: true },
        sourceSection: 'Annexure 1, Page 9',
      },
      {
        routeNumber: 3,
        routeLabel: 'Route C — Naval Architecture',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 28,
        additionalConditions: {
          degreeField: 'naval_architecture',
          navalArchitectureMustBeFirst: true,
          instituteTypes: ['aicte', 'iit', 'university_engineering'],
        },
        sourceSection: 'Annexure 1, Page 10',
      },
    ],
  },
  {
    courseId: 'diploma-marine-engineering',
    courseName: 'Diploma in Marine Engineering',
    courseSlug: 'diploma-marine-engineering',
    department: 'engine',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — Diploma Mechanical/Naval Arch/Electrical',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 22,
        additionalConditions: {
          diplomaStreams: ['mechanical', 'naval_architecture', 'electrical', 'electrical_electronics'],
        },
        sourceSection: 'Annexure 1, Page 10',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — Diploma Shipbuilding',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 23,
        additionalConditions: { diplomaStreams: ['shipbuilding_engineering'] },
        sourceSection: 'Annexure 1, Page 10-11',
      },
    ],
  },
  {
    courseId: 'electro-technical-officer',
    courseName: 'Electro-Technical Officers (ETO)',
    courseSlug: 'electro-technical-officer',
    department: 'eto',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — 4-Year Degree',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'either',
        maxAgeGeneral: 35,
        additionalConditions: {
          degreeStreams: ['electrical', 'electronics', 'electrical_electronics', 'electronics_telecommunication', 'electronics_instrumentation'],
          recognizedByGovtOrAICTE: true,
          englishAlternative: { ifBelow50InSchool: 'eligible if 50% in degree AND medium English' },
        },
        sourceSection: 'Annexure 1, Page 11',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — Lateral Entry Diploma to Degree',
        qualificationRequired: 'engineering_grad',
        minAggregatePercentage: 50,
        minEnglishPercentage: 50,
        englishCheckLevel: 'class_10',
        maxAgeGeneral: 35,
        additionalConditions: {
          lateralEntryFromDiploma: true,
          englishAlternative: { ifBelow50In10th: 'eligible if 60% diploma OR 50% degree AND medium English' },
        },
        sourceSection: 'Annexure 1, Page 12',
      },
      {
        routeNumber: 3,
        routeLabel: 'Route C — 3-Year Diploma',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 60,
        minEnglishPercentage: 50,
        englishCheckLevel: 'class_10',
        maxAgeGeneral: 35,
        additionalConditions: {
          diplomaStreams: ['electrical', 'electronics', 'electrical_electronics', 'electronics_telecommunication', 'electronics_instrumentation'],
          englishAlternative: { ifBelow50In10th: 'eligible if 60% diploma AND medium English' },
        },
        sourceSection: 'Annexure 1, Page 12',
      },
    ],
  },
  {
    courseId: 'gp-rating',
    courseName: 'General Purpose Rating (GP Rating)',
    courseSlug: 'gp-rating',
    department: 'ratings',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — Class 10',
        qualificationRequired: 'class_10',
        minAggregatePercentage: 40,
        minEnglishPercentage: 40,
        englishCheckLevel: 'class_10',
        minAge: 17.5,
        maxAgeGeneral: 25,
        additionalConditions: { subjectsRequired: ['science', 'mathematics'] },
        sourceSection: 'Annexure 1, Page 13',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — 2-Year ITI',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 50,
        minEnglishPercentage: 40,
        englishCheckLevel: 'class_10',
        minAge: 17.5,
        maxAgeGeneral: 25,
        additionalConditions: { itiDuration: 2, govtApprovedInstitute: true },
        sourceSection: 'Annexure 1, Page 13',
      },
      {
        routeNumber: 3,
        routeLabel: 'Route C — Diploma/Degree Holders',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 40,
        minEnglishPercentage: 40,
        englishCheckLevel: 'class_10',
        minAge: 17.5,
        maxAgeGeneral: 27,
        additionalConditions: { diplomaOrDegreeHolder: true, shipboardTrainingWithin1Year: true },
        sourceSection: 'Annexure 1, Page 13',
      },
    ],
  },
  {
    courseId: 'maritime-catering-ccmc',
    courseName: 'Certificate Course in Maritime Catering (CCMC)',
    courseSlug: 'maritime-catering-ccmc',
    department: 'catering',
    routes: [
      {
        routeNumber: 1,
        routeLabel: 'Route A — Class 10',
        qualificationRequired: 'class_10',
        minAggregatePercentage: 40,
        minEnglishPercentage: 40,
        englishCheckLevel: 'class_10',
        minAge: 17.5,
        maxAgeGeneral: 25,
        sourceSection: 'Annexure 1, Page 13',
      },
      {
        routeNumber: 2,
        routeLabel: 'Route B — Diploma/Degree Holders',
        qualificationRequired: 'diploma',
        minAggregatePercentage: 40,
        minEnglishPercentage: 40,
        englishCheckLevel: 'class_10',
        minAge: 17.5,
        maxAgeGeneral: 27,
        additionalConditions: { diplomaOrDegreeHolder: true, shipboardTrainingWithin1Year: true },
        sourceSection: 'Annexure 1, Page 13',
      },
    ],
  },
]
