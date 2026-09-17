// src/types/investor-contact.ts
/** A person the team can reach about an investor listing. */
export interface InvestorContact {
    /** Stable id within the listing's contact list. */
    id: string;
  
    /** Full name of the person or firm. */
    fullName: string;
  
    /** Role relative to the deal, e.g. "broker", "owner", "assistant". */
    role: string;
  
    /** Email address for this contact. */
    email: string;
  
    /** Optional — not every contact shares a phone. */
    phone?: string;
  }