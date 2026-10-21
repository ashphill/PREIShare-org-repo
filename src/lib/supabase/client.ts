// src/lib/supabase/client.ts
// BROWSER-SAFE Supabase client.
// Reads ONLY the public VITE_ variables from .env.example:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// The service-role key is never read here. Every request from this client is
// limited by Row Level Security (owner_id = auth.uid()).
// Setup: docs/setup/supabase-env-checklist.md

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export type BrowserSupabaseClient = SupabaseClient<Database>

/**
 * Create the browser Supabase client (sign up / sign in / sign out, session).
 * Env is read when the function is called, not at module load.
 */
export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  const url: string | undefined = import.meta.env.VITE_SUPABASE_URL
  const anonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
        'Copy .env.example to .env.local, fill in the public values, and restart the dev server. ' +
        'See docs/setup/supabase-env-checklist.md',
    )
  }

  return createClient<Database>(url, anonKey)
}
