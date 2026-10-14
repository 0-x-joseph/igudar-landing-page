import "server-only";
import type { Locale } from "@/i18n/routing";
import type { Attribution, EventProps, LeadForm } from "@/lib/acquisition";
import { serviceClient } from "./service-client";

export class LeadStorageNotConfiguredError extends Error {
  constructor() {
    super("Lead storage is not configured.");
  }
}

export interface LandingLead {
  form: LeadForm;
  locale: Locale;
  /** ISO timestamp of the moment the visitor ticked the consent box. */
  consentAt: string;
  attribution: Attribution;
  /** Bucketed context only (e.g. amount_bucket, scenario); never an exact amount. */
  props: EventProps;
}

/**
 * Saves a waitlist or simulator-interest email in `public.landing_leads`. Returns true for a new
 * lead and false for a duplicate (same email and form): the first answer wins and is never
 * overwritten (insert ... on conflict do nothing). Errors carry no personal data or keys.
 */
export async function saveLandingLead(email: string, lead: LandingLead): Promise<boolean> {
  const client = serviceClient();
  if (!client) throw new LeadStorageNotConfiguredError();

  const { data, error } = await client
    .from("landing_leads")
    .upsert({
      email: email.trim().toLowerCase(),
      form: lead.form,
      locale: lead.locale,
      consent_at: lead.consentAt,
      path: lead.attribution.path,
      visitor_id: lead.attribution.visitorId,
      utm_source: lead.attribution.utmSource,
      utm_medium: lead.attribution.utmMedium,
      utm_campaign: lead.attribution.utmCampaign,
      props: lead.props,
    }, { onConflict: "email,form", ignoreDuplicates: true })
    .select("id");

  if (error || !Array.isArray(data)) throw new Error("Lead could not be stored.");
  return data.length > 0;
}
