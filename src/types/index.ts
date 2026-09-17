// src/types/index.ts
// Re-export public types so fixtures import from one place.
export type { ListingStatus } from './listing-status';
export type {
  InvestorListing,
  InvestorListingBase,
  ClosedInvestorListing,
  OpenInvestorListing,
} from './investor-listing';
export type { InvestorContact } from './investor-contact';
export type { Ownership } from './ownership';
export type { Address } from './address';
export type { FinancialSummary } from './financial-summary';
export type { PropertyType } from './property-type';