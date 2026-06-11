import { GraduationCap } from 'lucide-react'

export const metadata = { title: 'CET Prep Hub — Maritime AI Guide' }

export default function CetPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-2xl mb-6">
        <GraduationCap className="w-8 h-8 text-warning" />
      </div>
      <h1 className="font-display text-4xl font-bold text-primary mb-3">CET Preparation Hub</h1>
      <p className="text-text-secondary text-lg mb-4">Practice tests, topic guides, and IMU CET schedule for 2025.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 4
      </span>
    </div>
  )
}
