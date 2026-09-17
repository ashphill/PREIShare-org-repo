// src/fixtures/invalid-listings.errors.ts
// INTENTIONAL TYPE ERRORS — this file should NOT typecheck cleanly.
// Each export demonstrates a failure mode documented in
// docs/type-safety/expected-type-errors.md

import type { InvestorListing } from "../types";

// Case: status spelled in a way the union does not allow
export const invalidStatusSpelling: InvestorListing = {
  id: "listing-bad-status",
  title: "Downtown duplex offering",
  summary: "Two-unit residential offering near downtown.",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  status: "availble", // should error: not in ListingStatus union
  propertyType: "multifamily",
  address: {
    line1: "100 Main St",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US"
  },
  financialSummary: {
    askingPrice: 450000,
    currency: "USD"
  },
  contacts: [
    { id: "c1", fullName: "Alex Rivera", email: "alex@example.com", role: "primary" }
  ],
  primaryContactId: "c1",
  ownership: { ownerName: "Rivera Holdings", ownershipPercent: 100 }
};

// Case: required nested address field missing
// NOTE: this is the one documented teaching exception where `as InvestorListing`
// is used — without it, TypeScript would report the error on the whole object's
// shape rather than pinpointing the missing `city` field the way this fixture
// is meant to demonstrate. This is intentional and should not be "fixed."
export const missingAddressCity = {
  id: "listing-missing-city",
  title: "Lakeview fourplex",
  summary: "Four-unit multifamily property on the lake.",
  createdAt: "2026-01-05T00:00:00Z",
  updatedAt: "2026-01-05T00:00:00Z",
  status: "draft",
  propertyType: "multifamily",
  address: {
    line1: "22 Lake Rd",
    // city missing on purpose
    region: "TX",
    postalCode: "78702",
    country: "US"
  },
  contacts: [
    { id: "c2", fullName: "Sam Lee", email: "sam@example.com", role: "primary" }
  ],
  primaryContactId: "c2",
  ownership: { ownerName: "Lee Capital", ownershipPercent: 100 }
} as InvestorListing;

// Case: numeric money field given as a string
export const priceAsString: InvestorListing = {
  id: "listing-price-string",
  title: "Cedar Street portfolio slice",
  summary: "Single-family asset within a larger portfolio.",
  createdAt: "2026-01-10T00:00:00Z",
  updatedAt: "2026-01-10T00:00:00Z",
  status: "published",
  propertyType: "land",
  address: {
    line1: "9 Cedar St",
    city: "Dallas",
    region: "TX",
    postalCode: "75201",
    country: "US"
  },
  financialSummary: {
    askingPrice: "610000", // should error: string is not number
    currency: "USD"
  },
  contacts: [
    { id: "c3", fullName: "Jordan Kim", email: "jordan@example.com", role: "primary" }
  ],
  primaryContactId: "c3",
  ownership: { ownerName: "Kim Investors", ownershipPercent: 100 }
};

// Case: empty contacts array on a published listing (business rule: at least
// one contact required once a listing is investor-visible — but note the
// current InvestorListing type does NOT enforce a minimum array length, so
// TypeScript will NOT flag this. This gap is a candidate for the hole-hunt pass.
export const emptyContactsOnPublished: InvestorListing = {
  id: "listing-empty-contacts",
  title: "Willow Creek Land Parcel",
  summary: "Undeveloped land parcel ready for entitlement work.",
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
  status: "published",
  propertyType: "land",
  address: {
    line1: "500 Willow Creek Rd",
    city: "San Marcos",
    region: "TX",
    postalCode: "78666",
    country: "US"
  },
  financialSummary: {
    askingPrice: 300000,
    currency: "USD"
  },
  contacts: [], // business rule says this should be invalid for published, but type allows it
  primaryContactId: "",
  ownership: { ownerName: "Willow Creek LLC" }
};

// Case: sold status missing required closedAt
export const soldWithoutClosedAt = {
  id: "listing-sold-no-closed-at",
  title: "Bell Tower Retail — Sold",
  summary: "Retail center sold to a private investor.",
  createdAt: "2025-10-01T00:00:00Z",
  updatedAt: "2026-01-20T00:00:00Z",
  status: "sold",
  // closedAt intentionally omitted — should error since the 'sold' branch requires it
  propertyType: "retail",
  address: {
    line1: "1 Bell Tower Way",
    city: "Waco",
    region: "TX",
    postalCode: "76701",
    country: "US"
  },
  financialSummary: {
    askingPrice: 1200000,
    currency: "USD"
  },
  contacts: [
    { id: "c4", fullName: "Taylor Brooks", email: "taylor@example.com", role: "seller_rep" }
  ],
  primaryContactId: "c4",
  ownership: { ownerName: "Bell Tower Holdings" }
} as InvestorListing;