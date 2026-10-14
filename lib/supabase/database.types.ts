import type { Locale } from "@/i18n/routing";
import type { BetaExperience, BetaTicketBucket } from "@/lib/waitlist-validation";

// Matches the checked-in migration; regenerate from Supabase after applying it
// if more tables are added. No credentials belong in database types.
export type BetaApplicationInsert = {
  email: string;
  first_name: string;
  location: string;
  ticket_bucket: BetaTicketBucket;
  experience: BetaExperience;
  consent_at: string;
  locale: Locale;
  source: "beta";
  id?: string;
  submitted_at?: string;
};

export type Database = {
  public: {
    Tables: {
      beta_applications: {
        Row: BetaApplicationInsert & { id: string; submitted_at: string };
        Insert: BetaApplicationInsert;
        Update: Partial<BetaApplicationInsert>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
