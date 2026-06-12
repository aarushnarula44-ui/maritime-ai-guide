import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20

// Chainable no-op stub for every Supabase query builder method.
// Supports arbitrarily deep chains like .eq().order().limit().maybeSingle().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeChain(): any {
  const terminal = {
    data: null,
    error: null,
    count: 0,
  }
  const chain: Record<string, unknown> = {}
  const methods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'in', 'is', 'not', 'or', 'and', 'filter', 'match',
    'order', 'limit', 'range', 'abortSignal',
    'returns', 'throwOnError',
  ]
  for (const m of methods) {
    chain[m] = () => makeChain()
  }
  // Terminal methods return resolved promises
  chain['single'] = async () => terminal
  chain['maybeSingle'] = async () => terminal
  chain['csv'] = async () => terminal
  // Allow the chain itself to be awaited (resolves to { data: [], error: null })
  chain['then'] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: [], error: null, count: 0 }).then(resolve)
  return chain
}

export function createClient() {
  if (!isConfigured) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        exchangeCodeForSession: async () => ({ data: null, error: null }),
      },
      from: () => makeChain(),
    } as unknown as ReturnType<typeof createServerClient<Database>>
  }

  const cookieStore = cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookies can be read but not written
        }
      },
    },
  })
}
