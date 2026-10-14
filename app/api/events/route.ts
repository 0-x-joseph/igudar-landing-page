import { NextRequest } from "next/server";
import { ACQ_LIMITS, parseEventsBody } from "@/lib/acquisition";
import { insertLandingEvents } from "@/lib/supabase/landing-events";

/**
 * Anonymous first-party behaviour from the landing site (see `lib/analytics.ts`).
 *
 * Accepts `{ events: [...] }` as JSON or as the text/plain body navigator.sendBeacon sends.
 * At most 10 events and 16 KB per request (the body is read with a hard cap, chunked or not); every field is validated against the contract
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
// Security review: 10 requests x 10 events = at most ~100 rows a minute per IP and instance. Add a Vercel Firewall
// rate rule on /api/events for a global limit (per-instance maps reset on cold start).
const RATE_LIMIT_MAX = 10;
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

/** Reads at most `limit` bytes of the body; null when it is larger (a chunked body has no content-length to check). */
async function readCapped(request: NextRequest, limit: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

/** Browsers send Sec-Fetch-Site; a beacon from our own pages is same-origin. Pages of other sites are refused. */
function fromOurPages(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  return site === null || site === "same-origin" || site === "none";
}

export async function POST(request: NextRequest) {
  try {
    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > ACQ_LIMITS.REQUEST_BYTES) return noContent();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) return noContent();
    if (!fromOurPages(request)) return noContent();

    const body = await readCapped(request, ACQ_LIMITS.REQUEST_BYTES);
    if (body === null) return noContent();
    const rows = parseEventsBody(body);
    if (rows.length > 0) await insertLandingEvents(rows);
  } catch {
    // Storage or parsing failure: drop silently. The message carries no personal data.
    console.error("Landing events were dropped.");
  }
  return noContent();
}
