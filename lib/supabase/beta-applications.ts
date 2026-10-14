import "server-only";
import type { Locale } from "@/i18n/routing";
import type { Attribution } from "@/lib/acquisition";
import type { BetaApplication } from "@/lib/waitlist-validation";
import type { BetaAttributionColumns } from "./database.types";
import { serviceClient } from "./service-client";

export class BetaStorageNotConfiguredError extends Error {
  constructor() {
    super("Beta application storage is not configured.");
  }
}

/** Only the attribution values that are present, so an application without them inserts the original columns. */
function attributionColumns(a: Attribution | undefined): BetaAttributionColumns {
  if (!a) return {};
  const cols: BetaAttributionColumns = {};
  if (a.visitorId) cols.visitor_id = a.visitorId;
  if (a.path) cols.path = a.path;
  if (a.utmSource) cols.utm_source = a.utmSource;
  if (a.utmMedium) cols.utm_medium = a.utmMedium;
  if (a.utmCampaign) cols.utm_campaign = a.utmCampaign;
  return cols;
}

/** Returns true for a new application, false for a duplicate. Never updates
 * existing answers from this unauthenticated endpoint. Errors omit PII and keys.
 * The attribution columns are nullable; they come from the app repo's acquisition migration. */
export async function saveBetaApplication(
  email: string,
  beta: BetaApplication,
  locale: Locale,
  attribution?: Attribution,
): Promise<boolean> {
  // Lazy construction keeps builds valid without runtime secrets.
  const client = serviceClient();
  if (!client) throw new BetaStorageNotConfiguredError();

  const { data, error } = await client
    .from("beta_applications")
    .upsert({
      email: email.trim().toLowerCase(),
      first_name: beta.firstName,
      location: beta.location,
      ticket_bucket: beta.ticketBucket,
      experience: beta.experience,
      consent_at: beta.consentAt,
      locale,
      source: beta.source,
      ...attributionColumns(attribution),
    }, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (error || !Array.isArray(data)) throw new Error("Beta application could not be stored.");
  return data.length > 0;
}
