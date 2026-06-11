import { createClient } from '@/lib/supabase/server'
import { SkeletonCard } from '@/components/ui/LoadingSkeleton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
          {greeting}, {name} 👋
        </h1>
        <p className="text-text-secondary mt-1">Welcome to your maritime career dashboard.</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Eligibility status card */}
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white rounded-xl border border-border p-6 h-48">
            <p className="font-semibold text-text-secondary text-sm mb-4">Eligibility Status</p>
            <SkeletonCard />
          </div>
        </div>

        {/* CET countdown */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-primary text-white rounded-xl p-6 h-48">
            <p className="text-blue-300 text-sm font-medium mb-2">IMU CET 2025</p>
            <p className="font-display text-4xl font-bold text-accent mb-1">—</p>
            <p className="text-blue-200 text-sm">days to exam</p>
            <div className="mt-4 space-y-2">
              <div className="skeleton h-3 w-full rounded opacity-30" />
              <div className="skeleton h-3 w-2/3 rounded opacity-20" />
            </div>
          </div>
        </div>

        {/* Performance card */}
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="font-semibold text-text-secondary text-sm mb-4">CET Performance Overview</p>
            <div className="grid grid-cols-5 gap-3">
              {['Math', 'Physics', 'Chemistry', 'English', 'Aptitude'].map((s) => (
                <div key={s} className="text-center">
                  <div className="skeleton h-20 w-full rounded-lg mb-2" />
                  <p className="text-xs text-text-muted">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NavAI quick chat */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent text-xl">✨</span>
              <span className="font-semibold">Ask NavAI</span>
            </div>
            <p className="text-blue-200 text-sm mb-4">Your AI maritime career advisor is ready to help.</p>
            <div className="bg-white/10 rounded-lg px-4 py-3 text-blue-200 text-sm">
              Ask me about eligibility, courses, salaries...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
