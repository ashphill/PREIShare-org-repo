   # Investor listing types — verification checklist

   Use this list before review. Check each box only when you have evidence.

   ## A. Domain coverage
   - [ ] Every required field from docs/domain/listing-field-inventory.md appears on InvestorListing (or a nested type it uses).
   - [ ] Listing status values match the allowed business statuses (no free-form strings).
   - [ ] Property type values match the allowed property kinds.
   - [ ] Address and FinancialSummary nested shapes match the inventory.
   - [ ] Investor contact and ownership relationship fields match the domain brief.

   ## B. Type safety shape
   - [ ] Public types are exported from src/types/index.ts.
   - [ ] Discriminated / narrowed status modeling (if used) still matches docs/type-safety/expected-type-errors.md.
   - [ ] Readonly intent is documented where the team agreed on it.

   ## C. Fixtures
   - [ ] src/fixtures/sample-investor-listings.ts typechecks cleanly and includes more than one realistic listing.
   - [ ] src/fixtures/invalid-listings.errors.ts still demonstrates the intentional failures listed in docs/type-safety/expected-type-errors.md.
   - [ ] Expected-error notes still match the real compiler messages (no stale examples).

   ## D. Typecheck gate
   - [ ] package.json defines a `typecheck` script that runs `tsc --noEmit`.
   - [ ] Running the typecheck script from the project root succeeds for valid sources.
   - [ ] The intentional invalid fixtures file is not required to pass the normal typecheck gate.
   - [ ] src/types/README.md explains how a beginner runs typecheck and what success looks like.

   ## E. Sign-off
   - [ ] I re-ran typecheck after any last fixes.
   - [ ] I would hand this package to a teammate without a verbal walkthrough of secret steps.