// src/server/listings.ts
// Server functions (TanStack Start createServerFn) for property listings:
//   listMyListings  — loader: the signed-in sponsor's listings, newest first
//   createListing   — action: create a listing owned by the signed-in sponsor
//   updateListing   — action: update one of the sponsor's own listings
//
// Rules this file follows:
// - Handlers run ONLY on the server; the browser calls them over RPC.
// - Every operation checks the session with requireSessionUser (src/lib/auth/session.ts)
//   and returns a clear error when nobody is signed in.
// - Supabase is reached ONLY through createServerSupabaseClient (src/lib/supabase/server.ts),
//   acting AS the sponsor with their access token, so Postgres RLS
//   (owner_id = auth.uid()) applies. No service-role key, no browser client.
// - owner_id always comes from the session, never from the request body.
// - Results are structured { ok, ... } objects; raw database errors are logged on the
//   server, not sent to the browser.

import { createServerFn } from '@tanstack/react-start'
import { requireSessionUser } from '../lib/auth/session'
import { createServerSupabaseClient } from '../lib/supabase/server'
import type { PropertyListingInsert, PropertyListingRow, PropertyListingUpdate } from '../lib/supabase/types'
import { parseCreateListingInput, parseUpdateListingInput } from '../lib/listings/schema'
import type { FieldErrors } from '../lib/listings/schema'

export type ListingRow = PropertyListingRow

export type ListingsResult =
  | { ok: true; listings: ListingRow[] }
  | { ok: false; error: string }

export type ListingMutationResult =
  | { ok: true; listing: ListingRow }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

const NOT_SIGNED_IN = 'You must be signed in to manage listings.'

/** Loader: listings for the signed-in sponsor only (session check + RLS + owner filter). */
export const listMyListings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ListingsResult> => {
    const session = await requireSessionUser()
    if (!session) return { ok: false, error: NOT_SIGNED_IN }

    const supabase = createServerSupabaseClient(session.accessToken)
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[listings] list failed:', error.message)
      return { ok: false, error: 'Could not load your listings. Please try again.' }
    }

    // An empty array is a normal, successful result for a new sponsor.
    return { ok: true, listings: data }
  },
)

/** Action: create a listing owned by the session user. Body owner_id is ignored. */
export const createListing = createServerFn({ method: 'POST' })
  // Pass input through; validation runs in the handler so errors come back as fieldErrors.
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    const session = await requireSessionUser()
    if (!session) return { ok: false, error: NOT_SIGNED_IN }

    const parsed = parseCreateListingInput(data)
    if (!parsed.success) {
      return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: parsed.fieldErrors }
    }

    const insert: PropertyListingInsert = {
      ...parsed.data,
      owner_id: session.user.id, // ownership from the session only
    }

    const supabase = createServerSupabaseClient(session.accessToken)
    const { data: row, error } = await supabase
      .from('property_listings')
      .insert(insert)
      .select('*')
      .single()

    if (error) {
      console.error('[listings] create failed:', error.message)
      return { ok: false, error: 'Could not create the listing. Please check your input and try again.' }
    }

    return { ok: true, listing: row }
  })

/** Action: update a listing by id, only if the signed-in sponsor owns it. Ownership cannot change. */
export const updateListing = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    const session = await requireSessionUser()
    if (!session) return { ok: false, error: NOT_SIGNED_IN }

    const parsed = parseUpdateListingInput(data)
    if (!parsed.success) {
      return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: parsed.fieldErrors }
    }

    // id selects the row; everything else is the patch. owner_id is never in the patch.
    const { id, ...fields } = parsed.data
    const patch: PropertyListingUpdate = fields

    const supabase = createServerSupabaseClient(session.accessToken)
    const { data: row, error } = await supabase
      .from('property_listings')
      .update(patch)
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[listings] update failed:', error.message)
      return { ok: false, error: 'Could not update the listing. Please try again.' }
    }
    if (!row) {
      // Same message for "does not exist" and "belongs to someone else" so nothing leaks.
      return { ok: false, error: 'Listing not found, or you do not have access to it.' }
    }

    return { ok: true, listing: row }
  })
