import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

const CAREER_ARC_DATA = {
  deck: [
    { year: 0, salary: 600, rank: 'Deck Cadet' },
    { year: 2, salary: 2000, rank: 'Third Officer' },
    { year: 5, salary: 3000, rank: 'Second Officer' },
    { year: 8, salary: 5500, rank: 'Chief Officer' },
    { year: 12, salary: 9000, rank: 'Chief Officer (senior)' },
    { year: 18, salary: 12000, rank: 'Master / Captain' },
  ],
  engine: [
    { year: 0, salary: 600, rank: 'Engine Cadet' },
    { year: 3, salary: 3000, rank: 'Fourth Engineer' },
    { year: 6, salary: 5000, rank: 'Third Engineer' },
    { year: 10, salary: 7000, rank: 'Second Engineer' },
    { year: 15, salary: 12000, rank: 'Chief Engineer' },
    { year: 20, salary: 15000, rank: 'Chief Engineer (senior)' },
  ],
  eto: [
    { year: 0, salary: 3000, rank: 'Junior ETO' },
    { year: 5, salary: 5000, rank: 'ETO' },
    { year: 10, salary: 6000, rank: 'Senior ETO' },
  ],
}

const VESSEL_TYPE_DATA = [
  { vessel: 'Container', chiefOfficerUSD: 5500, chiefEngineerUSD: 9000 },
  { vessel: 'Tanker', chiefOfficerUSD: 6000, chiefEngineerUSD: 10000 },
  { vessel: 'LNG/LPG', chiefOfficerUSD: 7000, chiefEngineerUSD: 14000 },
  { vessel: 'Bulk Carrier', chiefOfficerUSD: 5000, chiefEngineerUSD: 8000 },
  { vessel: 'Offshore', chiefOfficerUSD: 6500, chiefEngineerUSD: 11000 },
]

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { byCareerArc: CAREER_ARC_DATA, byVesselType: VESSEL_TYPE_DATA },
    { headers: { 'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600' } }
  )
}
