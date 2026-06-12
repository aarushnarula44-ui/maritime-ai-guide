import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Return immediately — analytics must never block the user
  const response = NextResponse.json({ ok: true })

  try {
    const body = await req.json()
    const { eventName, properties, pageUrl, deviceType } = body

    if (!eventName || typeof eventName !== 'string') return response

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

    // Non-blocking insert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('analytics_events')
      .insert({
        event_name: eventName,
        user_id: user?.id ?? null,
        properties: properties ?? null,
        page_url: pageUrl ?? null,
        device: deviceType ?? null,
        ip_address: ip,
      })
      .then(() => {})
      .catch(() => {})
  } catch {
    // Never fail for analytics
  }

  return response
}
