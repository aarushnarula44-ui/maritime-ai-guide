import { Metadata } from 'next'
import { ParentsClient } from './ParentsClient'

export const metadata: Metadata = {
  title: 'Merchant Navy — Guide for Parents | Maritime AI Guide',
  description: 'Everything parents need to know about their child\'s merchant navy career. Safety, salaries, education costs, sponsorships, and how to verify colleges.',
}

export default function ParentsPage() {
  return <ParentsClient />
}
