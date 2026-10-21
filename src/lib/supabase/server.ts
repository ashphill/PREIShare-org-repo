// src/lib/supabase/server.ts
// SERVER-ONLY Supabase clients.
// Import this file ONLY from TanStack Start server functions (createServerFn),
// route loaders' server code, or other server utilities.
// NEVER import it from React components, buttons, cards, or any browser code.
//
// Env names (must match .env.example / docs/setup/supabase-env-checklist.md):
//   SUPABASE_URL               server name for the project URL
//   VITE_SUPABASE_ANON_KEY     anon key (public value; used here to act AS the user under RLS)
//   SUPABASE_SERVICE_ROLE_KEY  SERVER-ONLY SECRET, bypasses RLS (admin/maintenance only)

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export type ServerSupabaseClient = SupabaseClient<Database>

const CHECKLIST = 'See docs/setup/supabase-env-checklist.md'

/** Stop immediately if this module is ever bundled into and run in the browser. */
function assertServer(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'src/lib/supabase/server.ts was loaded in the browser. ' +
        'Only server functions and loaders may import it. ' +
        CHECKLIST,
    )
  }
}

/** Read a required server env var at call time, with a clear error if it is missing. */
function requireServerEnv(name: string): string {
  // Read process.env through globalThis so this compiles with tsconfig "types": ["vite/client"].
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
  const value = env?.[name]
  if (!value) {
    throw new Error(`Missing server env var ${name}. Add it to .env.local (local) or your host's server env. ${CHECKLIST}`)
  }
  return value
}

/** Server-side auth options: never store or refresh a browser session on the server. */
const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const

/**
 * Default server client for sponsor requests (list my listings, create listing).
 * Acts AS the signed-in sponsor: pass the user's access token from the session
 * so Postgres RLS (owner_id = auth.uid()) applies to every query.
 * Uses the anon key, never the service role.
 */
export function createServerSupabaseClient(accessToken?: string): ServerSupabaseClient {
  assertServer()

  const url = requireServerEnv('SUPABASE_URL')
  const anonKey = requireServerEnv('VITE_SUPABASE_ANON_KEY')

  if (accessToken) {
    return createClient<Database>(url, anonKey, {
      auth: serverAuthOptions,
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
  }

  return createClient<Database>(url, anonKey, { auth: serverAuthOptions })
}

/**
 * ADMIN client using SUPABASE_SERVICE_ROLE_KEY. This BYPASSES Row Level Security.
 * Out of scope for normal sponsor features this sprint; use only for server-side
 * admin or maintenance jobs, and never return its results to the wrong sponsor.
 */
export function createServiceRoleSupabaseClient(): ServerSupabaseClient {
  assertServer()

  const url = requireServerEnv('SUPABASE_URL')
  const serviceRoleKey = requireServerEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, serviceRoleKey, { auth: serverAuthOptions })
}
