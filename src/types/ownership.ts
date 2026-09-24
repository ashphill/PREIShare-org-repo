// src/types/ownership.ts
/** Who owns the property and how ownership is described for PREIshare. */
export interface Ownership {
    /** Person or entity name shown on the listing. */
    ownerName: string;
  
    /** Optional free-text about splits, trusts, or co-owners. */
    notes?: string;
  
    /** When known, percent owned by this owner (0–100). */
    ownershipPercent?: number;
  }