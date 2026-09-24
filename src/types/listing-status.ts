// src/types/listing-status.ts
// Closed set of lifecycle states from docs/domain/listing-field-inventory.md.
// Only these exact strings are allowed—no free text.
export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "archived";