/**
 * Core PREIshare investor listing — scalar fields only.
 * Nested types (address, financials, contacts) and unions
 * (status, property type) are added in later steps.
 */

import type { ListingStatus } from "./listing-status.ts";
import type { PropertyType } from "./property-type.ts";
import type { Address } from "./address.ts";
import type { FinancialSummary } from "./financial-summary.ts";

export interface InvestorListing {
    /** Stable unique id for this listing (assigned by the system). */
    id: string;
  
    /** Short public headline shown in search results and cards. */
    title: string;
  
    /** Longer plain-text description of the investment opportunity. */
    summary: string;
  
    /**
     * Asking price in whole US dollars (no currency symbol).
     * Example: 450000 means $450,000.
     */
    askingPrice: number;
  
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
  }