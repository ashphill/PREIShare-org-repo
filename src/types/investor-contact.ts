// src/types/investor-contact.ts
/** A person the team can reach about an investor listing. */
export interface InvestorContact {
    /** Stable id within the listing's contact list. */
    id: string;
  
    /** Person or firm name. */
    name: string;
  
    /** Why this contact appears on the listing, e.g. "broker", "owner_rep". */
    role: string;
  
    /** Email address, if used. At least one of email or phone is required. */
    email?: string;
  
    /** Phone number, if used. At least one of email or phone is required. */
    phone?: string;
  }