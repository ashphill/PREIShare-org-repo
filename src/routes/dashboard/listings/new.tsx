// /dashboard/listings/new — create a property listing.
// Protected by the dashboard layout's session gate. Submits through the
// createListing server function; ownership is set on the server from the session.
// Shared schema checks give instant field errors; the server validates again.
import { useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { ListingForm } from '../../../components/listings/ListingForm'
import type { ListingFormValues } from '../../../components/listings/ListingForm'
import { parseCreateListingInput } from '../../../lib/listings/schema'
import type { FieldErrors } from '../../../lib/listings/schema'
import { createListing } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/new')({
  component: NewListingPage,
})

function NewListingPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: ListingFormValues) {
    setErrorMessage(null)
    setFieldErrors({})

    // Quick check in the browser with the same schema the server uses.
    const parsed = parseCreateListingInput(values)
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors)
      setErrorMessage('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createListing({ data: parsed.data })
      if (!result.ok) {
        setErrorMessage(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await router.invalidate()
      await navigate({ to: '/dashboard/listings' })
    } catch {
      setErrorMessage('Could not save the listing. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="new-listing-heading" className="max-w-2xl">
      <p className="mb-2 text-sm">
        <Link to="/dashboard/listings" className="underline">
          ← Back to listings
        </Link>
      </p>
      <h1 id="new-listing-heading" className="mb-4 text-xl font-semibold">
        Add a property listing
      </h1>
      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Create listing"
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
      />
    </section>
  )
}
