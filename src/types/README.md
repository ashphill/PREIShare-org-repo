# PREIshare investor listing types

This folder holds **shared TypeScript types** for PREIshare investor listings.

## Why this exists
Loose objects and ad-hoc JSON let bad data reach production (missing price,
status spelled three ways, nested address fields that vanish on one screen).
These types catch those mistakes at **compile time**—before users see them.

## What belongs here
- Domain type modules only (listing, address, status, contacts, etc.)
- No UI components, no API route handlers, no database clients

## How to check types
From the project root after `npm install`:

```bash
npm run typecheck
```

That runs `tsc --noEmit`: TypeScript checks every file under `src/` and reports
errors without writing JavaScript output files.

## Strict mode (plain language)
`strict: true` in `tsconfig.json` turns on the checker's safest rules. Combined
with flags like `noUncheckedIndexedAccess`, it refuses incomplete or loosely
typed data so the team can trust shared listing models.

## Source of truth
Business vocabulary and field rules come from:
`docs/domain/investor-listing-domain-brief.md`
(and the field inventory from `docs/domain/listing-field-inventory.md`).