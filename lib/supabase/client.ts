import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20

export function createClient() {
  if (!isConfigured) {
    // Return a no-op proxy so the app renders without crashing
    // when Supabase env vars are not yet filled in
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured. Fill in .env.local' } }),
        signInWithOAuth: async () => ({ error: null }),
        signUp: async () => ({ error: { message: 'Supabase not configured. Fill in .env.local' } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
