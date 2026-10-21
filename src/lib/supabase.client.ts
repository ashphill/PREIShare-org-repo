// src/lib/supabase.client.ts
// BROWSER-SAFE Supabase client.
// WHO MAY IMPORT: any code, including React components and route components
// (login and signup pages use it for sign in / sign up / sign out).
// Reads ONLY the public VITE_ variables from .env.example / docs/env-var-checklist.md:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// No secret keys belong in this file. Every request from this client is
// limited by Row Level Security (owner_id = auth.uid()).

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

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
        'See docs/env-var-checklist.md',
    )
  }

  return createClient<Database>(url, anonKey)
}
