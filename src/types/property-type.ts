// src/types/property-type.ts
// Closed set of property classifications from docs/domain/listing-field-inventory.md.
// Only these exact strings are allowed—no free text.
export type PropertyType =
  | "multifamily"
  | "office"
  | "retail"
  | "industrial"
  | "mixed_use"
  | "land";