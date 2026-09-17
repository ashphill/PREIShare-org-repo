# Investor Listing Domain Brief (PREIshare)

## Purpose
Define what an investor listing is in PREIshare business language so TypeScript types in later steps match real workflows — not invented fields. This brief is grounded in the PREIshare client story: each listing describes a property opportunity investors can review, with identity fields, a lifecycle status, property classification, a nested address, money-related summary numbers, and one or more investor contacts with ownership details.

## Actors
- **Listing editor (internal ops)** — creates and updates listings before investors see them; responsible for moving a listing from `draft` toward `published`.
- **Investor (end user)** — browses published listings and relies on complete, consistent, trustworthy data to evaluate a property opportunity.
- **Reviewer / compliance** — checks that status, financial summary, and contact info are accurate and complete before a listing is published or advanced.
- **Future systems** — the PREIshare website UI, API layer, and Supabase/PostgreSQL database will all read and write the same listing shape.

## Business goals
- One shared, unambiguous definition of a listing across screens, teammates, and future systems.
- Catch missing or invalid data before production (at compile time once TypeScript types exist).
- Correctly model the real-world nested data every listing carries: address, financial summary, investor contacts, and ownership.
- Prevent "blob of text" listings — every field has a defined meaning, shape, and validity rule; nothing is a vague free-text catch-all.

## Listing lifecycle statuses (closed list — no free text)
- `draft` — internal only; listing is being prepared and is not visible to investors.
- `published` — visible to investors; must meet full validity rules (see Success criteria below).
- `under_offer` — an investor has active interest; listing remains structured like a published listing.
- `sold` — the deal has closed; listing is retained for historical record.
- `archived` — removed from active browse; retained but not deleted, and not investor-visible.

No other status values are valid. A type or database column that accepts any string is wrong.

## Nested data groups
- **Address** (nested object) — street line(s), city, region/state, postal code, country. Required to locate the property.
- **Financial summary** (nested object) — asking price, currency, and optional projected return metrics (e.g. projected IRR, cap rate) the team agrees to track.
- **Investor contacts** (list of nested objects) — one or more people tied to the listing, each with a name, role, and at least one reachable channel (email or phone).
- **Ownership** (list of nested objects, tied to contacts) — how each contact relates to the asset (e.g. primary owner, co-owner, broker, property manager) and an optional ownership share percentage.

## Core identity fields (high level)
- Stable listing id — never blank, never reused.
- Human-readable title — shown to investors, must be non-empty.
- Property type (closed list, e.g. `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`).
- Status (from the lifecycle list above).
- Short description for investors — required once a listing reaches `published` or later.
- Created/updated timestamps (as business concepts; exact format decided in a later step).

## Success criteria — "this listing is valid"
1. The listing has a non-empty, unique id and a non-empty title.
2. Status is exactly one of the five allowed lifecycle values — never a free-text variant, typo, or null for a published listing.
3. Property type is exactly one of the allowed closed-list values — never free text.
4. The address is a nested object containing enough fields to physically locate the property: street line, city, region/state, postal code, and country. A flat "address" string alone is not valid.
5. The financial summary is a nested object containing at minimum a numeric asking price and a currency code.
6. At least one investor contact exists, each with a name and at least one reachable channel (email or phone).
7. Every contact has an ownership relationship drawn from a closed list (e.g. `primary_owner`, `co_owner`, `broker`, `property_manager`) — never free text.
8. Optional fields (e.g. projected IRR, cap rate, ownership share percent, address line 2) may be absent. Required fields listed above must never be missing once a listing reaches `published`, `under_offer`, or `sold`.
9. A listing failing any of the above is not investor-visible, regardless of its status field — the status alone does not make a listing valid if required data is missing.

## Out of scope for this topic
- Building UI forms, API routes, or database tables/migrations.
- Authentication, payments, or document uploads.
- Exact TypeScript syntax and interface definitions (comes in later steps).
- Search, filtering, or ranking logic (pgvector-related features are a separate concern).

## Handoff note
Later steps must implement TypeScript types that honor this brief and the companion field inventory (`docs/domain/listing-field-inventory.md`) exactly. If a type allows a status, property type, or field not listed here, the type is wrong and must be corrected against this document — not the other way around.