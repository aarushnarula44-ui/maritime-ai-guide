import { User } from 'lucide-react'

export const metadata = { title: 'Profile — Maritime AI Guide' }

export default function ProfilePage() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
        <User className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-display text-3xl font-bold text-primary mb-3">Your Profile</h1>
      <p className="text-text-secondary mb-4">Manage your academic profile and preferences.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 5
      </span>
    </div>
  )
}
