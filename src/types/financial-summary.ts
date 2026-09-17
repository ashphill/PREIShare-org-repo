// src/types/financial-summary.ts
// Financial metric fields from docs/domain/listing-field-inventory.md.
export interface FinancialSummary {
    /**
     * Asking price in whole US dollars (no currency symbol).
     * Example: 450000 means $450,000.
     */
    askingPrice: number;
  
    /** Currency code for the asking price. */
    currency: string;
  
    /** Optional projected internal rate of return, as a percentage. */
    projectedIrrPercent?: number;
  
    /** Optional capitalization rate, as a percentage. */
    capRatePercent?: number;
  }