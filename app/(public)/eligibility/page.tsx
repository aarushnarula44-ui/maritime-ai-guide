import { CheckCircle } from 'lucide-react'

export const metadata = { title: 'Eligibility Checker — Maritime AI Guide' }

export default function EligibilityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-6">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>
      <h1 className="font-display text-4xl font-bold text-primary mb-3">Eligibility Checker</h1>
      <p className="text-text-secondary text-lg mb-4">Find out which maritime courses you qualify for in 60 seconds.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 2
      </span>
    </div>
  )
}
