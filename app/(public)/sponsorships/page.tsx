import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SponsorshipClient } from './SponsorshipClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Merchant Navy Sponsorship Programs India 2025 | Maritime AI Guide',
  description: 'Find merchant navy cadet sponsorship programs from top shipping companies. Get your maritime education funded.',
}

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
}

const STATIC_SPONSORSHIPS: SponsorshipRow[] = [
  { id: '1', company_name: 'Shipping Corporation of India', program_name: 'SCI Cadet Sponsorship', department: 'Deck', sponsorship_type: 'Full Sponsorship', bond_years: 3, stipend_usd: 200, fees_covered_pct: 100, status: 'closed', apply_by: null, last_verified: '2024-12-01', notes: 'Opens annually. Watch official website.' },
  { id: '2', company_name: 'Great Eastern Shipping', program_name: 'GET Cadet Program', department: 'Engine', sponsorship_type: 'Full Sponsorship', bond_years: 3, stipend_usd: 250, fees_covered_pct: 100, status: 'closed', apply_by: null, last_verified: '2024-11-15', notes: null },
  { id: '3', company_name: 'Anglo-Eastern Ship Management', program_name: 'AE Cadetship Program', department: 'Deck', sponsorship_type: 'Full Sponsorship', bond_years: 2, stipend_usd: 300, fees_covered_pct: 100, status: 'opening_soon', apply_by: null, last_verified: '2025-01-10', notes: 'Expected to open Q2 2025' },
  { id: '4', company_name: 'Maersk India', program_name: 'Maersk Cadet Program', department: 'Engine', sponsorship_type: 'Full Sponsorship', bond_years: 3, stipend_usd: 400, fees_covered_pct: 100, status: 'opening_soon', apply_by: null, last_verified: '2025-01-05', notes: null },
  { id: '5', company_name: 'ESSAR Shipping', program_name: 'ESSAR Cadet Scheme', department: 'Deck', sponsorship_type: 'Partial Sponsorship', bond_years: 2, stipend_usd: null, fees_covered_pct: 60, status: 'closed', apply_by: null, last_verified: '2024-10-20', notes: null },
  { id: '6', company_name: 'Synergy Marine Group', program_name: 'Synergy Cadetship', department: 'Engine', sponsorship_type: 'Guaranteed Employment', bond_years: null, stipend_usd: null, fees_covered_pct: null, status: 'closed', apply_by: null, last_verified: '2024-09-30', notes: null },
]

async function getSponsorships(): Promise<SponsorshipRow[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('sponsorship_programs' as never)
      .select('*')
      .order('status', { ascending: true })
    if (data && (data as SponsorshipRow[]).length > 0) return data as SponsorshipRow[]
  } catch {}
  return STATIC_SPONSORSHIPS
}

export default async function SponsorshipsPage() {
  const sponsorships = await getSponsorships()
  return <SponsorshipClient sponsorships={sponsorships} />
}
