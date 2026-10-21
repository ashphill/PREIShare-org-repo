// src/lib/listings/schema.ts
// Validation + types for property listing input, shared by the server functions
// in src/server/listings.ts and (in step 10) the listing forms.
//
// Field names and allowed values match exactly:
//   supabase/migrations/20250321000000_property_listings.sql
//   docs/data-model/property-listings-schema.md
//
// Plain TypeScript validation (no extra dependency). Safe for browser and server:
// it contains no secrets and never touches Supabase.
//
// owner_id is deliberately NOT part of any input type: ownership always comes
// from the signed-in session on the server, never from the request body.

import type { ListingStatusValue, PropertyTypeValue } from '../supabase/types'

/** Allowed status values — keep in sync with the migration's check constraint. */
export const LISTING_STATUSES = [
  'draft',
  'published',
  'under_offer',
  'sold',
  'archived',
] as const satisfies readonly ListingStatusValue[]

/** Allowed property types — keep in sync with the migration's check constraint. */
export const PROPERTY_TYPES = [
  'multifamily',
  'office',
  'retail',
  'industrial',
  'mixed_use',
  'land',
] as const satisfies readonly PropertyTypeValue[]

/** numeric(12,2) holds up to 9,999,999,999.99 */
const MAX_ASKING_PRICE = 9_999_999_999.99

/** Fields a sponsor provides when creating a listing. Defaults come from the database. */
export type CreateListingInput = {
  title: string
  summary?: string | null
  property_type: PropertyTypeValue
  address_line1: string
  address_line2?: string | null
  city: string
  region: string
  postal_code: string
  country?: string
  asking_price?: number | null
  currency?: string
  status?: ListingStatusValue
}

/** Update = the listing id plus any subset of the create fields (never owner_id). */
export type UpdateListingInput = { id: string } & Partial<CreateListingInput>

/** Field name -> list of messages, ready to show next to form inputs. */
export type FieldErrors = Record<string, string[]>

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: FieldErrors }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Small field readers. Each returns the cleaned value or records an error.
// ---------------------------------------------------------------------------

type Reader = {
  record: Record<string, unknown>
  errors: FieldErrors
}

function addError(reader: Reader, field: string, message: string): void {
  const existing = reader.errors[field]
  if (existing) existing.push(message)
  else reader.errors[field] = [message]
}

function has(reader: Reader, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(reader.record, field) && reader.record[field] !== undefined
}

function readRequiredText(reader: Reader, field: string, label: string, max: number): string | undefined {
  const value = reader.record[field]
  if (typeof value !== 'string' || value.trim().length === 0) {
    addError(reader, field, `${label} is required.`)
    return undefined
  }
  const trimmed = value.trim()
  if (trimmed.length > max) {
    addError(reader, field, `${label} must be ${max} characters or fewer.`)
    return undefined
  }
  return trimmed
}

/** Optional text: empty string becomes null so the column is cleared. */
function readOptionalText(reader: Reader, field: string, label: string, max: number): string | null | undefined {
  const value = reader.record[field]
  if (value === null) return null
  if (typeof value !== 'string') {
    addError(reader, field, `${label} must be text.`)
    return undefined
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > max) {
    addError(reader, field, `${label} must be ${max} characters or fewer.`)
    return undefined
  }
  return trimmed
}

function readChoice<T extends string>(
  reader: Reader,
  field: string,
  label: string,
  allowed: readonly T[],
): T | undefined {
  const value = reader.record[field]
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as T
  }
  addError(reader, field, `${label} must be one of: ${allowed.join(', ')}.`)
  return undefined
}

/** Accepts a number or numeric string (form inputs send strings). Empty means "no price". */
function readAskingPrice(reader: Reader, field: string): number | null | undefined {
  const value = reader.record[field]
  if (value === null || value === '') return null
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[$,\s]/g, '')) : Number.NaN
  if (!Number.isFinite(number)) {
    addError(reader, field, 'Asking price must be a number.')
    return undefined
  }
  if (number < 0) {
    addError(reader, field, 'Asking price must be zero or greater.')
    return undefined
  }
  if (number > MAX_ASKING_PRICE) {
    addError(reader, field, 'Asking price is too large.')
    return undefined
  }
  return Math.round(number * 100) / 100
}

function readCountry(reader: Reader, field: string): string | undefined {
  const value = readRequiredText(reader, field, 'Country', 2)
  if (value === undefined) return undefined
  if (!/^[A-Za-z]{2}$/.test(value)) {
    addError(reader, field, 'Country must be a 2-letter code, like US.')
    return undefined
  }
  return value.toUpperCase()
}

function readCurrency(reader: Reader, field: string): string | undefined {
  const value = readRequiredText(reader, field, 'Currency', 3)
  if (value === undefined) return undefined
  if (!/^[A-Za-z]{3}$/.test(value)) {
    addError(reader, field, 'Currency must be a 3-letter code, like USD.')
    return undefined
  }
  return value.toUpperCase()
}

function toReader(input: unknown): Reader | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null
  return { record: input as Record<string, unknown>, errors: {} }
}

/** Read every optional field that is present into `target` (shared by create and update). */
function readOptionalFields(reader: Reader, target: Partial<CreateListingInput>): void {
  if (has(reader, 'summary')) {
    const summary = readOptionalText(reader, 'summary', 'Summary', 5000)
    if (summary !== undefined) target.summary = summary
  }
  if (has(reader, 'address_line2')) {
    const line2 = readOptionalText(reader, 'address_line2', 'Address line 2', 300)
    if (line2 !== undefined) target.address_line2 = line2
  }
  if (has(reader, 'country')) {
    const country = readCountry(reader, 'country')
    if (country !== undefined) target.country = country
  }
  if (has(reader, 'asking_price')) {
    const price = readAskingPrice(reader, 'asking_price')
    if (price !== undefined) target.asking_price = price
  }
  if (has(reader, 'currency')) {
    const currency = readCurrency(reader, 'currency')
    if (currency !== undefined) target.currency = currency
  }
  if (has(reader, 'status')) {
    const status = readChoice(reader, 'status', 'Status', LISTING_STATUSES)
    if (status !== undefined) target.status = status
  }
}

// ---------------------------------------------------------------------------
// Public parsers
// ---------------------------------------------------------------------------

/** Validate input for creating a listing. Unknown keys (including owner_id) are ignored. */
export function parseCreateListingInput(input: unknown): ParseResult<CreateListingInput> {
  const reader = toReader(input)
  if (!reader) return { success: false, fieldErrors: { form: ['Listing details are missing.'] } }

  const title = readRequiredText(reader, 'title', 'Title', 200)
  const propertyType = readChoice(reader, 'property_type', 'Property type', PROPERTY_TYPES)
  const addressLine1 = readRequiredText(reader, 'address_line1', 'Street address', 300)
  const city = readRequiredText(reader, 'city', 'City', 120)
  const region = readRequiredText(reader, 'region', 'State / region', 120)
  const postalCode = readRequiredText(reader, 'postal_code', 'Postal code', 20)

  const optional: Partial<CreateListingInput> = {}
  readOptionalFields(reader, optional)

  if (
    Object.keys(reader.errors).length > 0 ||
    title === undefined ||
    propertyType === undefined ||
    addressLine1 === undefined ||
    city === undefined ||
    region === undefined ||
    postalCode === undefined
  ) {
    return { success: false, fieldErrors: reader.errors }
  }

  return {
    success: true,
    data: {
      ...optional,
      title,
      property_type: propertyType,
      address_line1: addressLine1,
      city,
      region,
      postal_code: postalCode,
    },
  }
}

/** Validate input for updating a listing: an id plus at least one editable field. */
export function parseUpdateListingInput(input: unknown): ParseResult<UpdateListingInput> {
  const reader = toReader(input)
  if (!reader) return { success: false, fieldErrors: { form: ['Listing details are missing.'] } }

  const idValue = reader.record.id
  const id = typeof idValue === 'string' && UUID_PATTERN.test(idValue) ? idValue : undefined
  if (!id) addError(reader, 'id', 'Listing id must be a valid UUID.')

  const patch: Partial<CreateListingInput> = {}

  if (has(reader, 'title')) {
    const title = readRequiredText(reader, 'title', 'Title', 200)
    if (title !== undefined) patch.title = title
  }
  if (has(reader, 'property_type')) {
    const propertyType = readChoice(reader, 'property_type', 'Property type', PROPERTY_TYPES)
    if (propertyType !== undefined) patch.property_type = propertyType
  }
  if (has(reader, 'address_line1')) {
    const line1 = readRequiredText(reader, 'address_line1', 'Street address', 300)
    if (line1 !== undefined) patch.address_line1 = line1
  }
  if (has(reader, 'city')) {
    const city = readRequiredText(reader, 'city', 'City', 120)
    if (city !== undefined) patch.city = city
  }
  if (has(reader, 'region')) {
    const region = readRequiredText(reader, 'region', 'State / region', 120)
    if (region !== undefined) patch.region = region
  }
  if (has(reader, 'postal_code')) {
    const postalCode = readRequiredText(reader, 'postal_code', 'Postal code', 20)
    if (postalCode !== undefined) patch.postal_code = postalCode
  }
  readOptionalFields(reader, patch)

  if (Object.keys(reader.errors).length > 0 || !id) {
    return { success: false, fieldErrors: reader.errors }
  }
  if (Object.keys(patch).length === 0) {
    return { success: false, fieldErrors: { form: ['No fields to update.'] } }
  }

  return { success: true, data: { ...patch, id } }
}
