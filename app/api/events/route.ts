import { NextRequest } from "next/server";
import { ACQ_LIMITS, parseEventsBody } from "@/lib/acquisition";
import { insertLandingEvents } from "@/lib/supabase/landing-events";

/**
 * Anonymous first-party behaviour from the landing site (see `lib/analytics.ts`).
 *
 * Accepts `{ events: [...] }` as JSON or as the text/plain body navigator.sendBeacon sends.
 * At most 20 events and 16 KB per request; every field is validated against the contract
 * (`lib/acquisition.ts`) and an invalid event is dropped, never coerced. Valid events are
 * inserted in one request with the service-role client.
 *
 * Always answers 204: the browser never learns whether anything was stored, nothing is
 * retried, and a page is never blocked. No IP, user agent or body is ever logged or stored.
 * Do Not Track / Global Privacy Control are honoured in the browser, which sends nothing.
 */
const noContent = () => new Response(null, { status: 204 });

// In-memory, per instance (same pattern as /api/waitlist). An IP is never persisted or logged.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_MAP_MAX = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > RATE_LIMIT_MAP_MAX) {
    for (const [key, entry] of rateLimitMap) if (now > entry.resetAt) rateLimitMap.delete(key);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > ACQ_LIMITS.REQUEST_BYTES) return noContent();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) return noContent();

    const rows = parseEventsBody(await request.text());
    if (rows.length > 0) await insertLandingEvents(rows);
  } catch {
    // Storage or parsing failure: drop silently. The message carries no personal data.
    console.error("Landing events were dropped.");
  }
  return noContent();
}
