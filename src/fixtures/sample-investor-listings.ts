// src/fixtures/sample-investor-listings.ts
// Field names and union members match src/types/index.ts and its modules exactly.

import type { InvestorListing } from "../types";

/** Published multifamily listing with full nested shapes. */
export const samplePublishedListing: InvestorListing = {
  id: "listing-001",
  title: "Riverfront Multifamily — 24 Units",
  summary: "Value-add 24-unit multifamily asset near downtown transit lines.",
  createdAt: "2026-01-10T09:00:00Z",
  updatedAt: "2026-02-01T14:30:00Z",
  status: "published",
  propertyType: "multifamily",
  address: {
    line1: "1200 River Rd",
    line2: "Suite 100",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US"
  },
  financialSummary: {
    askingPrice: 4250000,
    currency: "USD",
    projectedIrrPercent: 14.2,
    capRatePercent: 5.9
  },
  contacts: [
    {
      id: "contact-001",
      fullName: "Jordan Lee",
      email: "jordan.lee@example.com",
      phone: "+1-512-555-0142",
      role: "listing_agent"
    }
  ],
  primaryContactId: "contact-001",
  ownership: {
    ownerName: "PREI Riverfront Holdings LLC",
    ownershipPercent: 100
  }
};

/** Draft listing — still being prepared; financialSummary may be absent. */
export const sampleDraftListing: InvestorListing = {
  id: "listing-002",
  title: "Draft — Oak Street Retail Pad",
  summary: "Early-stage retail pad site being evaluated for listing.",
  createdAt: "2026-03-01T11:00:00Z",
  updatedAt: "2026-03-01T11:00:00Z",
  status: "draft",
  propertyType: "retail",
  address: {
    line1: "88 Oak St",
    city: "Dallas",
    region: "TX",
    postalCode: "75201",
    country: "US"
  },
  contacts: [],
  primaryContactId: "",
  ownership: {
    ownerName: "PREI Draft Vehicles LLC"
  }
};

/** Under-offer listing — exercises the under_offer status branch. */
export const sampleUnderOfferListing: InvestorListing = {
  id: "listing-003",
  title: "Cedar Industrial — Under Offer",
  summary: "Industrial distribution facility with an active investor offer.",
  createdAt: "2026-01-20T08:00:00Z",
  updatedAt: "2026-03-05T16:00:00Z",
  status: "under_offer",
  propertyType: "industrial",
  address: {
    line1: "4500 Cedar Blvd",
    city: "Houston",
    region: "TX",
    postalCode: "77002",
    country: "US"
  },
  financialSummary: {
    askingPrice: 6100000,
    currency: "USD",
    capRatePercent: 6.1
  },
  contacts: [
    {
      id: "contact-002",
      fullName: "Sam Rivera",
      email: "sam.rivera@example.com",
      role: "buyer_rep"
    }
  ],
  primaryContactId: "contact-002",
  ownership: {
    ownerName: "PREI Cedar JV",
    ownershipPercent: 60
  }
};

/** Sold listing — closed deal; closedAt is required on this status branch. */
export const sampleSoldListing: InvestorListing = {
  id: "listing-004",
  title: "Summit Office — Sold",
  summary: "Class A office building sold to a long-term institutional buyer.",
  createdAt: "2025-11-01T09:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
  status: "sold",
  closedAt: "2026-01-15T10:00:00Z",
  propertyType: "office",
  address: {
    line1: "1 Summit Plaza",
    city: "San Antonio",
    region: "TX",
    postalCode: "78205",
    country: "US"
  },
  financialSummary: {
    askingPrice: 2750000,
    currency: "USD",
    capRatePercent: 7.2
  },
  contacts: [
    {
      id: "contact-003",
      fullName: "Alex Chen",
      email: "alex.chen@example.com",
      role: "seller_rep"
    }
  ],
  primaryContactId: "contact-003",
  ownership: {
    ownerName: "PREI Summit LLC"
  }
};

/** Archived listing — removed from active browse, retained for record. */
export const sampleArchivedListing: InvestorListing = {
  id: "listing-005",
  title: "Archived — Maple Mixed-Use",
  summary: "Mixed-use property archived after an unsuccessful marketing period.",
  createdAt: "2025-06-01T09:00:00Z",
  updatedAt: "2025-12-01T09:00:00Z",
  status: "archived",
  propertyType: "mixed_use",
  address: {
    line1: "77 Maple Ave",
    city: "Fort Worth",
    region: "TX",
    postalCode: "76102",
    country: "US"
  },
  contacts: [
    {
      id: "contact-004",
      fullName: "Morgan Diaz",
      email: "morgan.diaz@example.com",
      role: "listing_agent"
    }
  ],
  primaryContactId: "contact-004",
  ownership: {
    ownerName: "PREI Maple Holdings LLC"
  }
};

/** All valid samples — useful for later UI mocks and typecheck scripts. */
export const sampleInvestorListings: InvestorListing[] = [
  samplePublishedListing,
  sampleDraftListing,
  sampleUnderOfferListing,
  sampleSoldListing,
  sampleArchivedListing
];