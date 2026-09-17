// src/types/address.ts
// Physical address fields from docs/domain/listing-field-inventory.md.
export interface Address {
    /** Street number and name. */
    line1: string;
  
    /** Unit, suite, or floor, if any. */
    line2?: string;
  
    /** City. */
    city: string;
  
    /** State, province, or region. */
    region: string;
  
    /** Postal or ZIP code. */
    postalCode: string;
  
    /** Country code or name. */
    country: string;
  }