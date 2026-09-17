/**
 * Core PREIshare investor listing.
 * Composes Address, FinancialSummary, InvestorContact[], and Ownership[];
 * unions for status and property type.
 */
import type { ListingStatus } from "./listing-status";
import type { PropertyType } from "./property-type";
import type { Address } from "./address";
import type { FinancialSummary } from "./financial-summary";
import type { InvestorContact } from "./investor-contact";
import type { Ownership } from "./ownership";

export interface InvestorListing {
  /** Stable unique id for this listing (assigned by the system). */
  id: string;

  /** Short public headline shown in search results and cards. */
  title: string;

  /** Longer plain-text description of the investment opportunity. */
  summary: string;

  /** ISO-8601 datetime string when the listing was first created. */
  createdAt: string;

  /** ISO-8601 datetime string when the listing was last updated. */
  updatedAt: string;

  /** Lifecycle state of the listing — must be one of the approved values. */
  status: ListingStatus;

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

  /** Ownership relationships tied to contacts in `contacts`. */
  ownership: Ownership[];
}