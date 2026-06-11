import { Metadata } from 'next'
import { SalaryExplorer } from './SalaryExplorer'

export const revalidate = 43200

export const metadata: Metadata = {
  title: 'Merchant Navy Salary in India 2025 — Rank-wise Data | Maritime AI Guide',
  description: 'Real merchant navy salary data for every rank. Captain earns $8000-15000/month. Chief Engineer up to $20000/month. Explore career earnings.',
}

export default function SalaryPage() {
  return <SalaryExplorer />
}
