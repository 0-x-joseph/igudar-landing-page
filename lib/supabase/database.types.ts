import type { Locale } from "@/i18n/routing";
import type { EventForm, LandingEvent, LeadForm } from "@/lib/acquisition";
import type { BetaExperience, BetaTicketBucket } from "@/lib/waitlist-validation";

// Written by hand. beta_applications matches this repo's checked-in migration; landing_events,
// landing_leads and the beta_applications attribution columns match the app repo's
// `20261014000400_acquisition_analytics.sql` (that repo owns the schema). Regenerate from
// Supabase after applying it if more tables are added. No credentials belong in database types.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Nullable columns added to beta_applications by the acquisition migration (no backfill). */
export type BetaAttributionColumns = {
  visitor_id?: string | null;
  path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

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
} & BetaAttributionColumns;

type BetaApplicationRow = Omit<BetaApplicationInsert, keyof BetaAttributionColumns | "id" | "submitted_at"> & {
  id: string;
  submitted_at: string;
  visitor_id: string | null;
  path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export type LandingEventInsert = {
  id?: number;
  occurred_at?: string;
  visitor_id: string;
  session_id: string;
  event: LandingEvent;
  form?: EventForm | null;
  path: string;
  locale?: Locale | null;
  referrer_host?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  props?: Json;
};

type LandingEventRow = {
  id: number;
  occurred_at: string;
  visitor_id: string;
  session_id: string;
  event: LandingEvent;
  form: EventForm | null;
  path: string;
  locale: Locale | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  props: Json;
};

export type LandingLeadInsert = {
  id?: string;
  email: string;
  form: LeadForm;
  locale?: Locale;
  consent_at?: string | null;
  path?: string | null;
  visitor_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  props?: Json;
  created_at?: string;
};

type LandingLeadRow = {
  id: string;
  email: string;
  form: LeadForm;
  locale: Locale;
  consent_at: string | null;
  path: string | null;
  visitor_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  props: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      beta_applications: {
        Row: BetaApplicationRow;
        Insert: BetaApplicationInsert;
        Update: Partial<BetaApplicationInsert>;
        Relationships: [];
      };
      landing_events: {
        Row: LandingEventRow;
        Insert: LandingEventInsert;
        Update: Partial<LandingEventInsert>;
        Relationships: [];
      };
      landing_leads: {
        Row: LandingLeadRow;
        Insert: LandingLeadInsert;
        Update: Partial<LandingLeadInsert>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
