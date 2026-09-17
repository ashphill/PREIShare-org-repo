# Sprint 2 Topic 1 — Types Handoff: PREIshare Investor Listings

**Audience:** next sprint topic owners, PREIshare eng, product partners
**Status:** Topic 1 (TypeScript foundations) complete — implementation topics not started
**Date:** 2026-09-17

## 1. Client story recap

PREIshare was shipping investor listing data as loose objects and ad-hoc JSON. That let bad data reach production: missing prices, status strings spelled several ways, and nested address fields that disappeared on some screens. Sprint 2 Topic 1 modeled investor listings with **strict TypeScript types** so those mistakes fail at **compile time** (while the developer is still building) instead of in front of users.

## 2. What we shipped this topic

| Deliverable | Path | Why it matters |
| --- | --- | --- |
| Domain brief + field inventory | `docs/domain/investor-listing-domain-brief.md`, `docs/domain/listing-field-inventory.md` | Business rules before code |
| Types package (barrel) | `src/types/index.ts` | Single import surface for `InvestorListing` and related types |
| Core + nested + relationship types | `src/types/investor-listing.ts`, `src/types/address.ts`, `src/types/financial-summary.ts`, `src/types/investor-contact.ts`, `src/types/ownership.ts`, `src/types/listing-status.ts`, `src/types/property-type.ts` | Interfaces, unions, nested objects, contacts, ownership |
| Valid fixtures | `src/fixtures/sample-investor-listings.ts` | Prove good listings type-check across all five statuses |
| Invalid / error cases + expected errors | `src/fixtures/invalid-listings.errors.ts`, `docs/type-safety/expected-type-errors.md` | Prove bad data is rejected |
| Typecheck script + verification checklist | `package.json` (`typecheck` and `typecheck:errors` scripts), `docs/type-safety/verification-checklist.md` | Repeatable safety gate |
| Decision record | `docs/decisions/ADR-001-investor-listing-types.md` | Stakeholder-facing type decisions |

**How to verify locally:** follow `docs/type-safety/verification-checklist.md` and run `npm run typecheck` from the project root. Valid fixtures must pass; `npm run typecheck:errors` confirms the intentional invalid cases in `src/fixtures/invalid-listings.errors.ts` remain type errors as documented.

## 3. What we must NOT claim is done yet

- No TanStack Start UI or listing forms are built or wired to these types.
- No Supabase / PostgreSQL tables, migrations, or pgvector work from this model.
- No HTTP API routes, request/response validation at the network boundary, or auth rules.
- No runtime schema library (for example Zod) is required by this topic unless a later topic adds one on purpose.
- No production deployment of listing create/edit flows.
- Contacts array minimum-length enforcement is a known, documented gap — the type currently allows a `published` listing with zero contacts, even though the domain brief requires at least one. See `emptyContactsOnPublished` in `docs/type-safety/expected-type-errors.md`.

If a demo only shows green typecheck on fixtures, say: **"the data model is typed and verified; product surfaces are next."**

## 4. Next sprint pickups (use the types — do not reinvent them)

### A. TanStack Start forms (UI)

- Build create/edit listing forms whose field names and option lists match `InvestorListing`, `ListingStatus`, and `PropertyType` from `src/types/index.ts`.
- Prefer importing types from `src/types/index.ts` rather than copying string literals into components.
- Use `src/fixtures/sample-investor-listings.ts` as realistic form defaults / Story-style examples.
- Acceptance sketch: a form cannot submit a status outside the union without a type or validation failure during development.

### B. Supabase / PostgreSQL schema alignment (data)

- Draft table columns that mirror required listing fields, nested address/financial concepts (as columns or related tables), and constrained status/property-type values.
- Document any intentional difference between TypeScript optional fields (like `financialSummary?`) and database NULL rules in a follow-up ADR — do not silently diverge.
- Plan indexes and relationships (contacts, ownership) from the same domain brief that drove the types.
- Acceptance sketch: a row that would fail `InvestorListing` assignment is also rejected by DB constraints or insert validation.

### C. API boundaries (server)

- Define request/response shapes for list/get/create/update that re-export or compose types from `src/types/index.ts` instead of anonymous JSON.
- Keep write endpoints from accepting free-form status strings; align with `ListingStatus` and `PropertyType` as tightened in Topic 1.
- Add tests that send fixture-shaped payloads (valid, from `sample-investor-listings.ts`) and known-bad payloads (invalid, from `invalid-listings.errors.ts`) at the boundary.
- Acceptance sketch: API handlers never widen listing status back to plain `string` without an explicit, documented escape hatch.

```text
Client pain (loose JSON)
        |
        v
 Domain brief + field inventory
        |
        v
 Strict TS types + fixtures + typecheck + ADR-001   <-- you are here
        |
        +--> TanStack Start forms (UI)
        +--> Supabase/PostgreSQL schema (data)
        +--> API routes & validation (boundary)
```

## 5. Prompting and review self-assessment

Complete in first person:

- **Prompting habit that helped:** I pushed back when an answer felt incomplete instead of accepting the first version. More than once I asked a follow-up like "why did you put 'should error' on those lines" or I asked to re-verify something instead of just trusting the agent's first explanation.
- **Second prompting habit that helped:** I asked for one file at a time rather than a full rewrite whenever something was wrong, which kept each fix small enough to actually review instead of re-trusting a whole regenerated file.
- **Review habit that caught an agent mistake:** I checked the actual Problems panel output instead of assuming code was correct just because it looked right — this is how I caught that two of my invalid fixtures were using as InvestorListing, which was silently hiding the exact errors those fixtures were supposed to demonstrate.
- **What I would do differently next topic:** I'd run the typecheck script earlier and more often during drafting, rather than waiting until the end of a step to confirm something actually compiled the way I expected.
- **Confidence (1–5) explaining InvestorListing to a teammate:** …

## 6. Handoff checklist for the next owner

- [ ] Read ADR-001 and this handoff before opening a UI or SQL PR
- [ ] Import listing types from `src/types/index.ts` only
- [ ] Keep `npm run typecheck` green on valid fixtures
- [ ] Do not delete intentional invalid fixture files; they document safety
- [ ] File a new ADR if product changes allowed statuses or required fields