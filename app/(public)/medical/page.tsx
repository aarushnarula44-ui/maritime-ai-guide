import { Metadata } from 'next'
import { MedicalClient } from './MedicalClient'

export const metadata: Metadata = {
  title: 'Medical Fitness Requirements for Merchant Navy India | Maritime AI Guide',
  description: 'Learn about vision, hearing, and health requirements for Indian merchant navy careers. DGS-approved medical standards including color vision rules for deck officers.',
}

export default function MedicalPage() {
  return <MedicalClient />
}
