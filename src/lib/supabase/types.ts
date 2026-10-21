// src/lib/supabase/types.ts
// Shared Database shape for the Supabase clients.
// Matches docs/data-model/property-listings-schema.md and
// supabase/migrations/20250321000000_property_listings.sql exactly.
// Safe to import from both browser and server code (types only, no secrets).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Allowed values for property_listings.status (check constraint in the migration). */
export type ListingStatusValue = 'draft' | 'published' | 'under_offer' | 'sold' | 'archived'

/** Allowed values for property_listings.property_type (check constraint in the migration). */
export type PropertyTypeValue =
  | 'multifamily'
  | 'office'
  | 'retail'
  | 'industrial'
  | 'mixed_use'
  | 'land'

export type Database = {
  public: {
    Tables: {
      property_listings: {
        /** A row as it comes back from a SELECT. */
        Row: {
          id: string
          owner_id: string
          title: string
          summary: string | null
          property_type: PropertyTypeValue
          address_line1: string
          address_line2: string | null
          city: string
          region: string
          postal_code: string
          country: string
          /** numeric(12,2) — Supabase returns it as a number. */
          asking_price: number | null
          currency: string
          status: ListingStatusValue
          created_at: string
          updated_at: string
        }
        /** Fields for an INSERT. Columns with database defaults are optional. */
        Insert: {
          id?: string
          /** Must equal the signed-in user's id (RLS WITH CHECK). Set on the server from the session. */
          owner_id: string
          title: string
          summary?: string | null
          property_type: PropertyTypeValue
          address_line1: string
          address_line2?: string | null
          city: string
          region: string
          postal_code: string
          country?: string
          asking_price?: number | null
          currency?: string
          status?: ListingStatusValue
          created_at?: string
          updated_at?: string
        }
        /** Fields for an UPDATE. Everything is optional. */
        Update: {
          id?: string
          owner_id?: string
          title?: string
          summary?: string | null
          property_type?: PropertyTypeValue
          address_line1?: string
          address_line2?: string | null
          city?: string
          region?: string
          postal_code?: string
          country?: string
          asking_price?: number | null
          currency?: string
          status?: ListingStatusValue
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

/** Convenience aliases for later loaders and server functions. */
export type PropertyListingRow = Database['public']['Tables']['property_listings']['Row']
export type PropertyListingInsert = Database['public']['Tables']['property_listings']['Insert']
export type PropertyListingUpdate = Database['public']['Tables']['property_listings']['Update']
