// src/types/investor-listing.ts
// Shared base + discriminated union on `status`.
// Nested types (Address, FinancialSummary, etc.) stay imported from earlier steps.

import type { Address } from './address';
import type { FinancialSummary } from './financial-summary';
import type { InvestorContact } from './investor-contact';
import type { Ownership } from './ownership';
import type { PropertyType } from './property-type';


/** Fields every investor listing has, regardless of status. */
export interface InvestorListingBase {
  /** Stable identity — do not reassign after create. */
  readonly id: string;

  /** Set once when the row is created. */
  readonly createdAt: string;

  /** May change when the listing is edited; still not a business key. */
  readonly updatedAt: string;

  /** Short public headline shown in search results and cards. */
  title: string;

  /** Longer plain-text description of the investment opportunity. */
  summary: string;

  /** Property classification — must be one of the approved values. */
  propertyType: PropertyType;

  /** Physical location of the property. Required for every listing. */
  address: Address;

  /**
   * Financial metrics for the listing.
   * May be missing early in the deal (e.g. draft status); required once published.
   */
  financialSummary?: FinancialSummary;

  /** One or more people associated with this listing. */
  contacts: InvestorContact[];

  /**
   * Must match InvestorContact.id of one entry in `contacts`.
   * TypeScript cannot fully enforce "id exists in array" alone;
   * we still type it as string so callers pass an id, not a whole loose object.
   */
  primaryContactId: string;

  /** Ownership description for the property. */
  ownership: Ownership;
}

/**
 * Discriminated union: TypeScript uses `status` to know which shape you have.
 * `closedAt` is required only when status is 'sold' (PREIshare's closed-deal state).
 */
export type InvestorListing =
  | (InvestorListingBase & {
      status: 'draft' | 'published' | 'under_offer' | 'archived';
      /** Not used unless the listing is sold. */
      closedAt?: undefined;
    })
  | (InvestorListingBase & {
      status: 'sold';
      /** ISO date string — required when the listing is sold. */
      closedAt: string;
    });

// Optional helper aliases
export type ClosedInvestorListing = Extract<InvestorListing, { status: 'sold' }>;
export type OpenInvestorListing = Exclude<InvestorListing, { status: 'sold' }>;