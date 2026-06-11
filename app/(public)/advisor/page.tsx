import { Sparkles } from 'lucide-react'

export const metadata = { title: 'NavAI Advisor — Maritime AI Guide' }

export default function AdvisorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h1 className="font-display text-4xl font-bold text-primary mb-3">NavAI — Maritime Career Advisor</h1>
      <p className="text-text-secondary text-lg mb-4">AI-powered guidance for your merchant navy career questions.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 4
      </span>
    </div>
  )
}
