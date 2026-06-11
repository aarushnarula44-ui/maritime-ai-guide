import { Settings } from 'lucide-react'

export const metadata = { title: 'Settings — Maritime AI Guide' }

export default function SettingsPage() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
        <Settings className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-display text-3xl font-bold text-primary mb-3">Settings</h1>
      <p className="text-text-secondary mb-4">Notification preferences, language, and account settings.</p>
      <span className="inline-block bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full">
        Coming in Sprint 5
      </span>
    </div>
  )
}
