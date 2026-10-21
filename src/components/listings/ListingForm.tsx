// Presentational create form for a property listing.
// Field names match src/lib/listings/schema.ts exactly. The parent decides what
// happens on submit (it calls the createListing server function); this component
// never talks to Supabase and never reads env vars.
import type { ReactNode } from 'react'
import { LISTING_STATUSES, PROPERTY_TYPES } from '../../lib/listings/schema'
import type { FieldErrors } from '../../lib/listings/schema'

/** Raw form values (strings, as the browser sends them). The schema parses and cleans them. */
export type ListingFormValues = {
  title: string
  property_type: string
  address_line1: string
  address_line2: string
  city: string
  region: string
  postal_code: string
  asking_price: string
  status: string
  summary: string
}

export type ListingFormProps = {
  onSubmit: (values: ListingFormValues) => void | Promise<void>
  submitLabel?: string
  errorMessage?: string | null
  fieldErrors?: FieldErrors
  isSubmitting?: boolean
}

const PROPERTY_TYPE_LABELS: Record<(typeof PROPERTY_TYPES)[number], string> = {
  multifamily: 'Multifamily',
  office: 'Office',
  retail: 'Retail',
  industrial: 'Industrial',
  mixed_use: 'Mixed use',
  land: 'Land',
}

const STATUS_LABELS: Record<(typeof LISTING_STATUSES)[number], string> = {
  draft: 'Draft',
  published: 'Published',
  under_offer: 'Under offer',
  sold: 'Sold',
  archived: 'Archived',
}

const inputClass =
  'w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2 disabled:opacity-60'

function readValue(data: FormData, name: keyof ListingFormValues): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

/** Small helper: label + control + that field's error messages, linked with aria-describedby. */
function Field({
  id,
  label,
  name,
  required,
  hint,
  fieldErrors,
  children,
}: {
  id: string
  label: string
  name: keyof ListingFormValues
  required?: boolean
  hint?: string
  fieldErrors: FieldErrors
  children: (describedBy: string | undefined, invalid: boolean) => ReactNode
}) {
  const errors = fieldErrors[name] ?? []
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, errors.length > 0 ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children(describedBy, errors.length > 0)}
      {hint ? (
        <p id={hintId} className="text-xs text-[var(--sea-ink-soft)]">
          {hint}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <p id={errorId} className="text-sm text-red-700">
          {errors.join(' ')}
        </p>
      ) : null}
    </div>
  )
}

export function ListingForm({
  onSubmit,
  submitLabel = 'Save listing',
  errorMessage = null,
  fieldErrors = {},
  isSubmitting = false,
}: ListingFormProps) {
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        void onSubmit({
          title: readValue(data, 'title'),
          property_type: readValue(data, 'property_type'),
          address_line1: readValue(data, 'address_line1'),
          address_line2: readValue(data, 'address_line2'),
          city: readValue(data, 'city'),
          region: readValue(data, 'region'),
          postal_code: readValue(data, 'postal_code'),
          asking_price: readValue(data, 'asking_price'),
          status: readValue(data, 'status'),
          summary: readValue(data, 'summary'),
        })
      }}
    >
      {errorMessage ? (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <Field id="listing-title" label="Title" name="title" required fieldErrors={fieldErrors}>
        {(describedBy, invalid) => (
          <input
            id="listing-title"
            name="title"
            type="text"
            required
            maxLength={200}
            disabled={isSubmitting}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={inputClass}
          />
        )}
      </Field>

      <Field id="listing-property-type" label="Property type" name="property_type" required fieldErrors={fieldErrors}>
        {(describedBy, invalid) => (
          <select
            id="listing-property-type"
            name="property_type"
            required
            defaultValue=""
            disabled={isSubmitting}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a type
            </option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field id="listing-address-line1" label="Street address" name="address_line1" required fieldErrors={fieldErrors}>
        {(describedBy, invalid) => (
          <input
            id="listing-address-line1"
            name="address_line1"
            type="text"
            required
            autoComplete="address-line1"
            disabled={isSubmitting}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={inputClass}
          />
        )}
      </Field>

      <Field id="listing-address-line2" label="Unit / suite (optional)" name="address_line2" fieldErrors={fieldErrors}>
        {(describedBy, invalid) => (
          <input
            id="listing-address-line2"
            name="address_line2"
            type="text"
            autoComplete="address-line2"
            disabled={isSubmitting}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={inputClass}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="listing-city" label="City" name="city" required fieldErrors={fieldErrors}>
          {(describedBy, invalid) => (
            <input
              id="listing-city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              disabled={isSubmitting}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClass}
            />
          )}
        </Field>

        <Field id="listing-region" label="State / region" name="region" required fieldErrors={fieldErrors}>
          {(describedBy, invalid) => (
            <input
              id="listing-region"
              name="region"
              type="text"
              required
              autoComplete="address-level1"
              disabled={isSubmitting}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClass}
            />
          )}
        </Field>

        <Field id="listing-postal-code" label="Postal code" name="postal_code" required fieldErrors={fieldErrors}>
          {(describedBy, invalid) => (
            <input
              id="listing-postal-code"
              name="postal_code"
              type="text"
              required
              autoComplete="postal-code"
              disabled={isSubmitting}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClass}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="listing-asking-price"
          label="Asking price (USD, optional)"
          name="asking_price"
          hint="Numbers only, for example 1250000."
          fieldErrors={fieldErrors}
        >
          {(describedBy, invalid) => (
            <input
              id="listing-asking-price"
              name="asking_price"
              type="text"
              inputMode="decimal"
              disabled={isSubmitting}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClass}
            />
          )}
        </Field>

        <Field id="listing-status" label="Status" name="status" fieldErrors={fieldErrors}>
          {(describedBy, invalid) => (
            <select
              id="listing-status"
              name="status"
              defaultValue="draft"
              disabled={isSubmitting}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClass}
            >
              {LISTING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id="listing-summary" label="Summary (optional)" name="summary" fieldErrors={fieldErrors}>
        {(describedBy, invalid) => (
          <textarea
            id="listing-summary"
            name="summary"
            rows={4}
            maxLength={5000}
            disabled={isSubmitting}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={inputClass}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-[44px] rounded-md bg-[var(--sea-ink)] px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
