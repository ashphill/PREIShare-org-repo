// src/types/ownership.ts
/** Closed set of relationships a contact can have to the property. */
export type OwnershipRelationship =
  | "primary_owner"
  | "co_owner"
  | "broker"
  | "property_manager";

/** How a specific contact relates to the asset. */
export interface Ownership {
  /** Which contact this ownership row refers to (matches an InvestorContact.id). */
  contactId: string;

  /** Relationship of the contact to the asset — must be an approved value. */
  relationship: OwnershipRelationship;

  /** Optional ownership share, as a percentage. */
  sharePercent?: number;
}