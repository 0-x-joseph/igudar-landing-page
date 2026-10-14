import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * The server-only service-role client, or null when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
 * not set. Built lazily per call so builds stay valid without runtime secrets. Requests time out
 * after 10 s so a slow database never hangs a route.
 */
export function serviceClient(): SupabaseClient<Database> | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) },
  });
}
