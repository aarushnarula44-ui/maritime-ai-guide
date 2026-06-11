import { Metadata } from 'next'
import { FraudProtectionClient } from './FraudProtectionClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Fraud Protection — Verify Maritime Colleges | Maritime AI Guide',
  description: 'Protect yourself from fake maritime institutes. Check if a college is DGS approved, learn warning signs, and report suspicious institutes.',
}

export const revalidate = 3600

async function getColleges() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('colleges')
      .select('id, name, slug, dgs_approval_status, city, state, type')
      .order('name')
    return data ?? []
  } catch {
    return []
  }
}

export default async function FraudProtectionPage() {
  const colleges = await getColleges()
  return <FraudProtectionClient colleges={colleges} />
}
