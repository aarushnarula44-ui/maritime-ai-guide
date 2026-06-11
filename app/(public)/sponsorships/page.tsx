import { Anchor } from 'lucide-react'

export const metadata = { title: 'Sponsorship Finder — Maritime AI Guide' }

export default function SponsorshipsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
        <Anchor className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-display text-4xl font-bold text-primary mb-3">Sponsorship Finder</h1>
      <p className="text-text-secondary text-lg mb-4">Find shipping companies offering full and partial sponsorships.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 3
      </span>
    </div>
  )
}
