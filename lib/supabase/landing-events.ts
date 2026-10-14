import "server-only";
import type { LandingEventRow } from "@/lib/acquisition";
import { serviceClient } from "./service-client";

/**
 * Inserts already-validated anonymous events into `public.landing_events` in one request.
 * Returns false when storage is not configured (nothing is stored). Throws a redacted error
 * on a database failure; the caller swallows it, since analytics must never break a page.
 */
export async function insertLandingEvents(rows: LandingEventRow[]): Promise<boolean> {
  if (rows.length === 0) return true;
  const client = serviceClient();
  if (!client) return false;
  const { error } = await client.from("landing_events").insert(rows);
  if (error) throw new Error("Landing events could not be stored.");
  return true;
}
