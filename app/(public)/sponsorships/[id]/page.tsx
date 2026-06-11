import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SponsorshipDetailClient } from './SponsorshipDetailClient'

interface SponsorshipRow {
  id: string
  company_name: string
  program_name: string
  department: string | null
  sponsorship_type: string | null
  bond_years: number | null
  stipend_usd: number | null
  fees_covered_pct: number | null
  status: string | null
  apply_by: string | null
  last_verified: string | null
  notes: string | null
  eligibility_notes: string | null
  selection_process: unknown | null
  eligible_courses: string[] | null
  company_type: string | null
  headquarters: string | null
  fleet_types: string[] | null
  website_url: string | null
}

const STATIC_SPONSORSHIPS: Record<string, SponsorshipRow> = {
  '1': {
    id: '1',
    company_name: 'Shipping Corporation of India',
    program_name: 'SCI Cadet Sponsorship',
    department: 'Deck',
    sponsorship_type: 'Full Sponsorship',
    bond_years: 3,
    stipend_usd: 200,
    fees_covered_pct: 100,
    status: 'closed',
    apply_by: null,
    last_verified: '2024-12-01',
    notes: 'Opens annually. Watch official website.',
    eligibility_notes: 'Indian nationals, Class 12 PCM with 60%+, age 17-25, medically fit as per MS Medical Examination Rules.',
    selection_process: [
      { stage: 1, title: 'Online Application', description: 'Submit application on SCI official website with documents.' },
      { stage: 2, title: 'Written Test', description: 'English, Mathematics, and Aptitude test conducted by SCI.' },
      { stage: 3, title: 'Medical Examination', description: 'Fitness test by DGS-approved medical examiner.' },
      { stage: 4, title: 'Personal Interview', description: 'Panel interview at SCI headquarters.' },
      { stage: 5, title: 'Offer Letter', description: 'Selected candidates receive offer letter and joining instructions.' },
    ],
    eligible_courses: ['B.Sc. Nautical Science', 'DNS'],
    company_type: 'Government PSU',
    headquarters: 'Mumbai, Maharashtra',
    fleet_types: ['Bulk Carriers', 'Tankers', 'Container Ships', 'Passenger Ships'],
    website_url: 'https://www.shipindia.com',
  },
  '2': {
    id: '2',
    company_name: 'Great Eastern Shipping',
    program_name: 'GET Cadet Program',
    department: 'Engine',
    sponsorship_type: 'Full Sponsorship',
    bond_years: 3,
    stipend_usd: 250,
    fees_covered_pct: 100,
    status: 'closed',
    apply_by: null,
    last_verified: '2024-11-15',
    notes: null,
    eligibility_notes: 'Class 12 PCM 60%+, age under 25. Preference for candidates with good English communication.',
    selection_process: [
      { stage: 1, title: 'Online Application', description: 'Apply via Great Eastern Shipping careers portal.' },
      { stage: 2, title: 'Written Test', description: 'Aptitude, English, and Technical Knowledge test.' },
      { stage: 3, title: 'Medical Examination', description: 'DGS-approved medical fitness certificate required.' },
      { stage: 4, title: 'Interview', description: 'Technical and HR interview round.' },
      { stage: 5, title: 'Offer Letter', description: 'Sponsorship agreement signed with bond terms.' },
    ],
    eligible_courses: ['GME', 'B.E. Marine Engineering'],
    company_type: 'Private Shipping Company',
    headquarters: 'Mumbai, Maharashtra',
    fleet_types: ['Tankers', 'Bulk Carriers', 'Dry Cargo'],
    website_url: 'https://www.greatship.com',
  },
  '3': {
    id: '3',
    company_name: 'Anglo-Eastern Ship Management',
    program_name: 'AE Cadetship Program',
    department: 'Deck',
    sponsorship_type: 'Full Sponsorship',
    bond_years: 2,
    stipend_usd: 300,
    fees_covered_pct: 100,
    status: 'opening_soon',
    apply_by: null,
    last_verified: '2025-01-10',
    notes: 'Expected to open Q2 2025',
    eligibility_notes: 'Class 12 with PCM, strong English. Age 17-25. Medical fitness mandatory.',
    selection_process: [
      { stage: 1, title: 'Online Application', description: 'Apply via Anglo-Eastern careers website.' },
      { stage: 2, title: 'Aptitude Test', description: 'Online or in-person aptitude and English test.' },
      { stage: 3, title: 'Medical Fitness', description: 'ENG1 standard medical by DGS-approved doctor.' },
      { stage: 4, title: 'Interview', description: 'Virtual or in-person panel interview.' },
      { stage: 5, title: 'Cadet Appointment', description: 'Appointment letter with joining date at approved institute.' },
    ],
    eligible_courses: ['B.Sc. Nautical Science', 'DNS'],
    company_type: 'Ship Management Company',
    headquarters: 'Hong Kong (India Office: Mumbai)',
    fleet_types: ['Container Ships', 'Bulk Carriers', 'Tankers', 'LNG Carriers'],
    website_url: 'https://www.angloeastern.com',
  },
  '4': {
    id: '4',
    company_name: 'Maersk India',
    program_name: 'Maersk Cadet Program',
    department: 'Engine',
    sponsorship_type: 'Full Sponsorship',
    bond_years: 3,
    stipend_usd: 400,
    fees_covered_pct: 100,
    status: 'opening_soon',
    apply_by: null,
    last_verified: '2025-01-05',
    notes: null,
    eligibility_notes: 'Diploma/B.E. in Engineering or Class 12 PCM with 60%+. Excellent English communication required.',
    selection_process: [
      { stage: 1, title: 'Online Application', description: 'Apply via Maersk global careers portal.' },
      { stage: 2, title: 'Online Assessment', description: 'Digital aptitude and English proficiency test.' },
      { stage: 3, title: 'Video Interview', description: 'Pre-recorded or live video interview with HR.' },
      { stage: 4, title: 'Medical', description: 'PEME (Pre-Employment Medical Examination) at approved clinic.' },
      { stage: 5, title: 'Offer & Joining', description: 'Formal sponsorship offer with training institute placement.' },
    ],
    eligible_courses: ['GME', 'B.E. Marine Engineering'],
    company_type: 'International Shipping Conglomerate',
    headquarters: 'Copenhagen, Denmark (India Office: Mumbai)',
    fleet_types: ['Container Ships', 'Tankers', 'Supply Vessels'],
    website_url: 'https://www.maersk.com/careers',
  },
  '5': {
    id: '5',
    company_name: 'ESSAR Shipping',
    program_name: 'ESSAR Cadet Scheme',
    department: 'Deck',
    sponsorship_type: 'Partial Sponsorship',
    bond_years: 2,
    stipend_usd: null,
    fees_covered_pct: 60,
    status: 'closed',
    apply_by: null,
    last_verified: '2024-10-20',
    notes: null,
    eligibility_notes: 'Class 12 PCM. Candidates expected to arrange remaining 40% fees independently or via education loan.',
    selection_process: [
      { stage: 1, title: 'Application', description: 'Send CV and Class 12 marksheet to HR email.' },
      { stage: 2, title: 'Written Test', description: 'General aptitude and English test.' },
      { stage: 3, title: 'Medical', description: 'DGS-approved medical examination.' },
      { stage: 4, title: 'Interview', description: 'HR and operations team interview.' },
      { stage: 5, title: 'Sponsorship Agreement', description: 'Sign bond and sponsorship terms before joining.' },
    ],
    eligible_courses: ['DNS', 'B.Sc. Nautical Science'],
    company_type: 'Private Shipping Company',
    headquarters: 'Mumbai, Maharashtra',
    fleet_types: ['Bulk Carriers', 'Tankers'],
    website_url: null,
  },
  '6': {
    id: '6',
    company_name: 'Synergy Marine Group',
    program_name: 'Synergy Cadetship',
    department: 'Engine',
    sponsorship_type: 'Guaranteed Employment',
    bond_years: null,
    stipend_usd: null,
    fees_covered_pct: null,
    status: 'closed',
    apply_by: null,
    last_verified: '2024-09-30',
    notes: null,
    eligibility_notes: 'Self-sponsored candidates. Synergy provides guaranteed employment after successful pre-sea training completion.',
    selection_process: [
      { stage: 1, title: 'Application', description: 'Apply via Synergy Marine Group website.' },
      { stage: 2, title: 'Screening', description: 'CV screening and preliminary assessment.' },
      { stage: 3, title: 'Medical', description: 'Standard seafarer medical examination.' },
      { stage: 4, title: 'Interview', description: 'HR interview and technical assessment.' },
      { stage: 5, title: 'Employment Letter', description: 'Guaranteed employment agreement upon course completion.' },
    ],
    eligible_courses: ['GME', 'B.E. Marine Engineering'],
    company_type: 'Ship Management Company',
    headquarters: 'Singapore (India Office: Mumbai)',
    fleet_types: ['Bulk Carriers', 'Tankers', 'Container Ships', 'Gas Carriers'],
    website_url: 'https://www.synergymarinegroup.com',
  },
}

async function getSponsorshipById(id: string): Promise<SponsorshipRow | null> {
  try {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('sponsorship_programs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (data) return data as SponsorshipRow
  } catch {}
  return STATIC_SPONSORSHIPS[id] ?? null
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sp = await getSponsorshipById(params.id)
  if (!sp) return { title: 'Sponsorship Not Found — Maritime AI Guide' }
  return {
    title: `${sp.company_name} — ${sp.program_name} | Maritime AI Guide`,
    description: `Learn about the ${sp.program_name} by ${sp.company_name}. ${sp.sponsorship_type}, ${sp.department} department. Bond: ${sp.bond_years ?? 'N/A'} years.`,
  }
}

export default async function SponsorshipDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let existingApplication = null
  if (user) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('user_applications')
        .select('*')
        .eq('user_id', user.id)
        .ilike('program_name', `%${params.id}%`)
        .maybeSingle()
      existingApplication = data
    } catch {}
  }

  const sponsorship = await getSponsorshipById(params.id)
  if (!sponsorship) notFound()

  return (
    <SponsorshipDetailClient
      sponsorship={sponsorship}
      userId={user?.id ?? null}
      existingApplication={existingApplication}
    />
  )
}
