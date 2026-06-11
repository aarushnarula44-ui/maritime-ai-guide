import { createClient } from '@/lib/supabase/server'
import { RoadmapClient } from './RoadmapClient'

export const metadata = { title: 'Career Roadmap — Maritime AI Guide' }

export default async function RoadmapPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let preferences = null
  if (user) {
    const { data } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle()
    preferences = data
  }

  return <RoadmapClient preferences={preferences} userId={user?.id ?? null} />
}
