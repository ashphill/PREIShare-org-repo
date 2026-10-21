// src/lib/supabase.server.ts
// SERVER-ONLY Supabase clients.
// WHO MAY IMPORT: TanStack Start server functions (createServerFn), server-only
// helpers (src/lib/auth/session.ts, src/server/listings.ts), and other server code.
// NEVER import it from React components, route components, buttons, cards, or
// any browser code. Browser code uses src/lib/supabase.client.ts instead.
//
// DEFAULT for sponsor dashboard data: createSupabaseServerClient(accessToken)
// (anon key + the sponsor's own token -> Postgres RLS applies).
// The service-role client is an escape hatch for admin jobs only.
//
// Session handling: the sponsor's tokens live in httpOnly cookies managed by
// src/lib/auth/session.ts (getCookie/setCookie from @tanstack/react-start/server).
// That helper reads the cookie and passes the access token in here, so no
// @supabase/ssr cookie adapter is needed.
//
// Env names (must match .env.example / docs/env-var-checklist.md):
//   SUPABASE_URL               server name for the project URL
//   VITE_SUPABASE_ANON_KEY     anon key (public value; used here to act AS the user under RLS)
//   SUPABASE_SERVICE_ROLE_KEY  SERVER-ONLY SECRET, bypasses RLS (admin/maintenance only)

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

export type ServerSupabaseClient = SupabaseClient<Database>

const CHECKLIST = 'See docs/env-var-checklist.md'

/** Stop immediately if this module is ever bundled into and run in the browser. */
function assertServer(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'src/lib/supabase.server.ts was loaded in the browser. ' +
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

/**
 * Project URL for server code. Prefers SUPABASE_URL, falls back to VITE_SUPABASE_URL
 * (same public value), and rejects the .env.example placeholder with a clear message.
 */
function requireServerSupabaseUrl(): string {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
  const candidates = [env?.SUPABASE_URL, env?.VITE_SUPABASE_URL]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
  const url = candidates.find((value) => !value.includes('your-project-ref'))
  if (!url) {
    throw new Error(
      candidates.length > 0
        ? `SUPABASE_URL is still the placeholder from .env.example. Put your real project URL in .env.local and restart the dev server. ${CHECKLIST}`
        : `Missing server env var SUPABASE_URL. Add it to .env.local (local) or your host's server env. ${CHECKLIST}`,
    )
  }
  return url
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

  const url = requireServerSupabaseUrl()
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

  const url = requireServerSupabaseUrl()
  const serviceRoleKey = requireServerEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, serviceRoleKey, { auth: serverAuthOptions })
}

/** Same as createServerSupabaseClient — name used in docs/env-var-checklist.md examples. */
export const createSupabaseServerClient = createServerSupabaseClient

/** Same as createServiceRoleSupabaseClient. SERVER ONLY, BYPASSES RLS — not for sponsor UI. */
export const createSupabaseServiceRoleClient = createServiceRoleSupabaseClient
