# Expected type errors for invalid investor listings

| id | business problem | rule that should catch it | expected TS kind |
|----|------------------|---------------------------|------------------|
| invalidStatusSpelling | status typo would break filters and workflows | ListingStatus string union | invalid string literal |
| missingAddressCity | city required for display/maps/location search | Address required fields | missing property |
| priceAsString | money must be numeric for math/sorting/filtering | FinancialSummary.askingPrice: number | type not assignable |
| emptyContactsOnPublished | a published listing with no contacts is not investor-visible per the domain brief | **GAP — not currently enforced.** InvestorListing.contacts is typed as InvestorContact[], which allows an empty array. No minimum-length rule exists in the type today. | none — this currently typechecks cleanly, which is the hole this fixture documents |
| soldWithoutClosedAt | a sold deal must record when it closed | InvestorListing discriminated union — closedAt required on the 'sold' branch | missing property |

## Notes
- `src/fixtures/invalid-listings.errors.ts` is supposed to fail typechecking — do not "fix" those errors by loosening types.
- `missingAddressCity` and `soldWithoutClosedAt` use `as InvestorListing` as a documented teaching exception, so the error surfaces on the specific missing field rather than a generic shape mismatch. This is intentional.
- `emptyContactsOnPublished` currently passes typechecking even though it violates a real business rule from `docs/domain/investor-listing-domain-brief.md` (success criterion #6: at least one contact required for published/under_offer/sold). This is a known type-system gap to address in the hole-hunting pass.
- Happy-path samples live in `src/fixtures/sample-investor-listings.ts` and must stay valid.