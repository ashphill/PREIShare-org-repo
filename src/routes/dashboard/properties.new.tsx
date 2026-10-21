// src/routes/dashboard/properties.new.tsx — /dashboard/properties/new
// Create a property listing (table: public.property_listings).
//
// Security model (docs/data-model-and-rls-matrix.md, migration listings_insert_own):
// - Protected by the dashboard guard in src/routes/dashboard.tsx, and the server
//   function below re-checks the session before writing.
// - The insert runs ON THE SERVER with createSupabaseServerClient(accessToken) from
//   src/lib/supabase.server.ts (anon key + the sponsor's token), so the RLS policy
//   WITH CHECK (owner_id = auth.uid()) decides whether the row is accepted.
// - owner_id is set from the session user id only. The form has no owner field, and
//   the shared schema ignores any owner_id sent in the request.
// - Success (navigate back to the list) happens only after the database confirms the
//   insert. Any error, including an RLS rejection, is shown and the user stays here.
// - No service-role key in this route.
import { useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ListingForm } from '../../components/listings/ListingForm'
import type { ListingFormValues } from '../../components/listings/ListingForm'
import { requireSessionUser } from '../../lib/auth/session'
import { parseCreateListingInput } from '../../lib/listings/schema'
import type { FieldErrors } from '../../lib/listings/schema'
import { createSupabaseServerClient } from '../../lib/supabase.server'
import type { PropertyListingInsert } from '../../lib/supabase/types'

type CreatePropertyResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

/** Postgres error code for "insufficient privilege" (RLS WITH CHECK rejection). */
const RLS_DENIED = '42501'

/** Server mutation: validates input, then inserts AS the signed-in sponsor under RLS. */
export const createProperty = createServerFn({ method: 'POST' })
  // Pass raw input through; validation happens in the handler so errors come back as fieldErrors.
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<CreatePropertyResult> => {
    const session = await requireSessionUser()
    if (!session) {
      return { ok: false, error: 'You must be signed in to add a property.' }
    }

    // Same schema as the listings flow: only real columns, owner_id never read from input.
    const parsed = parseCreateListingInput(data)
    if (!parsed.success) {
      return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: parsed.fieldErrors }
    }

    const insert: PropertyListingInsert = {
      ...parsed.data,
      owner_id: session.user.id, // ownership from the session — matches WITH CHECK (owner_id = auth.uid())
    }

    const supabase = createSupabaseServerClient(session.accessToken)
    const { data: row, error } = await supabase
      .from('property_listings')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      console.error('[properties] create failed:', error.code, error.message)
      return {
        ok: false,
        error:
          error.code === RLS_DENIED
            ? 'The database rejected this property: you can only create properties you own.'
            : 'Could not save the property. Please check your input and try again.',
      }
    }

    return { ok: true, id: row.id }
  })

export const Route = createFileRoute('/dashboard/properties/new')({
  component: NewPropertyPage,
})

function NewPropertyPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: ListingFormValues) {
    setErrorMessage(null)
    setFieldErrors({})

    // Instant feedback in the browser; the server validates again before inserting.
    const precheck = parseCreateListingInput(values)
    if (!precheck.success) {
      setFieldErrors(precheck.fieldErrors)
      setErrorMessage('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createProperty({ data: precheck.data })
      if (!result.ok) {
        // Stay on the form and show why — never claim success on a failed write.
        setErrorMessage(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await router.invalidate()
      await navigate({ to: '/dashboard/properties' })
    } catch {
      setErrorMessage('Could not save the property. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="new-property-heading" className="max-w-2xl">
      <p className="mb-2 text-sm">
        <Link to="/dashboard/properties" className="underline">
          ← Back to your properties
        </Link>
      </p>
      <h1 id="new-property-heading" className="mb-1 text-xl font-semibold">
        Add property
      </h1>
      <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
        New properties are saved to your sponsor account only (enforced by the database).
      </p>
      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Create property"
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
      />
    </section>
  )
}
