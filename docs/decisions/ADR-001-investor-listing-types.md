# ADR-001: Investor listing TypeScript types (PREIshare)

- **Status:** Accepted (Sprint 2, Topic 1)
- **Date:** 2026-09-17
- **Owners:** PREIshare types working group (learner + coach)
- **Related code:** `src/types/index.ts` (barrel export for the types package)

## Context

PREIshare investor listings were previously passed around as loose objects and ad-hoc JSON. That allowed production bugs such as missing prices, status values spelled several ways, and nested address fields that disappeared on some screens. Sprint 2 Topic 1 models the listing domain with strict TypeScript types so invalid shapes fail at compile time — before users see them.

Business inputs that drove the model:

- Domain brief: `docs/domain/investor-listing-domain-brief.md`
- Field inventory: `docs/domain/listing-field-inventory.md`
- Safety evidence: `docs/type-safety/expected-type-errors.md` and `docs/type-safety/verification-checklist.md`

## Decision

We adopt a small, explicit types package centered on `InvestorListing`, with supporting types for status, property type, address, financial summary, investor contacts, and ownership. Call sites should import from `src/types/index.ts` rather than reaching into individual files when possible.

## Type choices mapped to business rules

| Business rule (plain language) | Type choice | Why this shape |
| --- | --- | --- |
| A listing must always have core identity and pricing fields the UI and ops depend on | Required properties on `InvestorListingBase` (not optional `?`) — `id`, `title`, `summary`, `createdAt`, `updatedAt`, `address`, `contacts`, `primaryContactId`, `ownership` | Optional core fields reintroduce the "missing price" class of bugs |
| Listing workflow status may only be a known set of values | String union type for listing status — exactly `draft`, `published`, `under_offer`, `archived`, `sold` in `src/types/listing-status.ts` | Free `string` allows typos and three spellings of the same status |
| Property category is a closed vocabulary | String union type for property type — `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` in `src/types/property-type.ts` | Same reason as status: closed set, compile-time exhaustiveness |
| Street/city/region/postal data travels together | Nested `Address` object type (`line1`, optional `line2`, `city`, `region`, `postalCode`, `country`) | Prevents half-present address fields and keeps location shape consistent across screens |
| Money rollups are a structured summary, not one anonymous number | Nested, optional `FinancialSummary` object type (`askingPrice`, `currency`, optional `projectedIrrPercent`, optional `capRatePercent`) | Makes required money fields explicit and keeps totals grouped; optional at the listing level since early draft listings may not have financials yet |
| Who to contact about a listing is structured data | `InvestorContact[]` array, each with `id`, `fullName`, `role`, `email`, optional `phone`, plus a `primaryContactId` pointer on the listing | Stops "contact" from being a random string blob, and keeps the primary-contact reference typed rather than an untyped flag buried in a contact object |
| Ownership is a single, structured description of who owns the property | `Ownership` object (`ownerName`, optional `notes`, optional `ownershipPercent`) | Captures the investor–listing relationship the domain brief requires |
| A closed deal must record when it closed, but no other status should | Discriminated union on `status`: `closedAt` is required only on the `'sold'` branch, and explicitly `undefined` on every other branch | Lets TypeScript require the right fields for the right status, rather than making `closedAt` optional everywhere |
| A listing's identity and creation timestamp should never be reassigned after creation | `readonly` on `id`, `createdAt`, and `updatedAt` in `InvestorListingBase` | Signals immutability intent at the type level and blocks accidental mutation at compile time |

## Alternatives considered

1. **Keep listings as `string` / `any` / untyped JSON**
   Rejected: fastest short term, but pushes every bug to runtime and production.

2. **One giant flat interface with dozens of optional fields**
   Rejected: optional everything recreates missing-field bugs; flat shapes hide address/financial structure.

3. **Enums (`enum`) for every closed vocabulary**
   Deferred/avoided for this beginner package in favor of string union types, which stay simple to read in fixtures and error messages. Revisit only if runtime enum objects become a clear need.

4. **Runtime schema library (for example Zod) as the source of truth in this topic**
   Out of scope for Topic 1. Compile-time types and fixtures come first; runtime validators can wrap the same decisions later.

## Consequences

**Positive**

- Invalid listings in `src/fixtures/invalid-listings.errors.ts` demonstrate the compiler rejecting bad data (see `docs/type-safety/expected-type-errors.md`).
- Valid samples in `src/fixtures/sample-investor-listings.ts` prove a realistic listing can be constructed for every status.
- `npm run typecheck` is the shared gate before merge; `npm run typecheck:errors` separately confirms the intentional failures still fire.

**Tradeoffs**

- Authors must use exact union members; "almost right" status strings fail typecheck by design.
- Nested objects mean fixtures and future API mappers must supply whole `Address` / `FinancialSummary` objects, not scattered fields.
- Discriminated/readonly choices add a small learning curve for beginners in exchange for stronger guarantees.

## Out of scope for Sprint 2 Topic 1

- Database tables, migrations, or Supabase row types
- HTTP API routes and request/response validation at runtime
- React form components and client-side validation UX
- Authentication, authorization, and multi-tenant rules
- pgvector / search indexing fields beyond what the current listing model already includes
- Changing production data or deploying a service
- Enforcing a minimum length on `contacts[]` at the type level — this is a known, documented gap (see `emptyContactsOnPublished` in `docs/type-safety/expected-type-errors.md`); the business rule exists in the domain brief but is not yet enforced by TypeScript

## Follow-ups (for the next topic / implementers)

1. Import domain types from `src/types/index.ts` when building UI or API layers.
2. Keep fixtures green under `npm run typecheck` before expanding the model.
3. If product adds a new listing status or property type, extend the **union** in `listing-status.ts` or `property-type.ts` and update fixtures + this ADR — do not widen the field back to free `string`.
4. Address the documented gap where a `published` listing can still have an empty `contacts[]` array, even though the domain brief requires at least one contact.
5. Consider runtime validators that mirror these types once API boundaries land.
6. Use `docs/type-safety/verification-checklist.md` as the acceptance gate when types change.

## Evidence links

- Domain brief: `docs/domain/investor-listing-domain-brief.md`
- Field inventory: `docs/domain/listing-field-inventory.md`
- Expected compile errors: `docs/type-safety/expected-type-errors.md`
- Verification checklist: `docs/type-safety/verification-checklist.md`
- Types entrypoint: `src/types/index.ts`