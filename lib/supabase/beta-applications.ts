import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/routing";
import type { BetaApplication } from "@/lib/waitlist-validation";
import type { Database } from "./database.types";

export class BetaStorageNotConfiguredError extends Error {
  constructor() {
    super("Beta application storage is not configured.");
  }
}

/** Returns true for a new application, false for a duplicate. Never updates
 * existing answers from this unauthenticated endpoint. Errors omit PII and keys. */
export async function saveBetaApplication(email: string, beta: BetaApplication, locale: Locale): Promise<boolean> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new BetaStorageNotConfiguredError();

  // Lazy construction keeps builds valid without runtime secrets.
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) },
  });
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
    }, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (error || !Array.isArray(data)) throw new Error("Beta application could not be stored.");
  return data.length > 0;
}
