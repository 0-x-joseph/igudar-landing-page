import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatMad } from "@/lib/finance";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/routing";
import { parseBetaApplication, parseInterestPayload, type WaitlistErrorCode } from "@/lib/waitlist-validation";
import {
  buildBetaEmail,
  buildBetaNotification,
  buildConfirmationEmail,
  buildInterestNotification,
  emailI18nFor,
} from "@/lib/waitlist-emails";

/**
 * Sign-ups live in a Resend Audience (the source of truth). Nothing is written to disk: serverless
 * filesystems are read-only. Beta answers travel in a notification email to the team.
 *
 * Errors are answered as stable codes (`{ error: "invalid_email" }`); the forms show
 * `beta.errors.<code>` in the visitor's language. The optional `locale` in the body picks the
 * language of the confirmation email; the team notification stays in English.
 */

const RESEND_API = "https://api.resend.com";
const AUDIENCE_NAME = "IGUDAR waitlist";
const DEFAULT_FROM = "IGUDAR <noreply@igudar.tech>";
const DEFAULT_NOTIFY = "hello@igudar.tech";

const mailFrom = () => process.env.MAIL_FROM?.trim() || DEFAULT_FROM;
const notifyTo = () => process.env.BETA_NOTIFY_EMAIL?.trim() || DEFAULT_NOTIFY;

// ── Audience (env id, or found/created once per instance) ──
let cachedAudienceId: string | null = null;

async function resendFetch(apiKey: string, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
}

async function getAudienceId(apiKey: string): Promise<string> {
  const fromEnv = process.env.RESEND_AUDIENCE_ID?.trim();
  if (fromEnv) return fromEnv;
  if (cachedAudienceId) return cachedAudienceId;

  const list = await resendFetch(apiKey, "/audiences", { method: "GET" });
  if (!list.ok) throw new Error(`Listing audiences failed (${list.status})`);
  const listed = (await list.json()) as { data?: Array<{ id: string; name: string }> };
  const found = listed.data?.find((a) => a.name === AUDIENCE_NAME);
  if (found) {
    cachedAudienceId = found.id;
    return found.id;
  }

  const created = await resendFetch(apiKey, "/audiences", { method: "POST", body: JSON.stringify({ name: AUDIENCE_NAME }) });
  if (!created.ok) throw new Error(`Creating the audience failed (${created.status})`);
  const { id } = (await created.json()) as { id: string };
  cachedAudienceId = id;
  return id;
}

async function upsertContact(apiKey: string, email: string, firstName?: string): Promise<void> {
  const audienceId = await getAudienceId(apiKey);
  const res = await resendFetch(apiKey, `/audiences/${encodeURIComponent(audienceId)}/contacts`, {
    method: "POST",
    body: JSON.stringify({ email, ...(firstName ? { first_name: firstName } : {}), unsubscribed: false }),
  });
  if (!res.ok) throw new Error(`Saving the contact failed (${res.status})`);
}

// ── Rate limiter (in-memory, per IP; the IP is never stored elsewhere or logged) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ── Email validation ───────────────────────────────────────
const BLOCKED_DOMAINS = [
  "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com", "yopmail.com",
  "10minutemail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "dispostable.com", "maildrop.cc", "temp-mail.org", "getnada.com",
];

function isValidEmail(email: string): boolean {
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return !BLOCKED_DOMAINS.includes(domain);
}

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const fail = (error: WaitlistErrorCode, status: number) => json({ error }, status);
const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "unknown error");

// ── POST handler ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) return fail("rate_limited", 429);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return fail("not_configured", 503);

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (typeof parsed !== "object" || parsed === null) return fail("invalid_request", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid_request", 400);
  }

  // Honeypot: bots fill hidden fields. Accept silently and do nothing.
  if (body.honeypot) return json({ success: true });

  const interestResult = parseInterestPayload(body);
  if (!interestResult.ok) return fail(interestResult.error, 400);
  const betaResult = parseBetaApplication(body);
  if (!betaResult.ok) return fail(betaResult.error, 400);
  const interest = interestResult.value;
  const beta = betaResult.value;

  if (!body.email || typeof body.email !== "string") return fail("invalid_email", 400);
  const email = body.email.trim().toLowerCase();
  if (!isValidEmail(email)) return fail("invalid_email", 400);

  // The visitor's language, for their confirmation email. Anything unknown falls back to English.
  const locale: Locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;

  try {
    await upsertContact(apiKey, email, beta?.firstName);
  } catch (e) {
    console.error("Waitlist contact upsert failed:", errorMessage(e));
    return fail("save_failed", 502);
  }

  const resend = new Resend(apiKey);

  // The team email carries the beta answers, so a beta application is not done until it is sent.
  if (beta) {
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: [notifyTo()],
      subject: `Beta application: ${beta.firstName}, ${beta.location}`,
      text: buildBetaNotification(email, beta),
    });
    if (error) {
      console.error("Beta notification failed:", error.message);
      return fail("application_failed", 502);
    }
  } else if (interest) {
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: [notifyTo()],
      subject: `Simulator interest: ${formatMad(interest.amountMad, { decimals: 0 })}`,
      text: buildInterestNotification(email, interest),
    });
    if (error) console.error("Team notification failed:", error.message);
  }

  const i18n = await emailI18nFor(locale);
  const { error: confirmError } = await resend.emails.send({
    from: mailFrom(),
    to: [email],
    subject: beta ? i18n.t("beta.subject") : i18n.t("confirmation.subject"),
    html: beta ? buildBetaEmail(i18n, beta) : buildConfirmationEmail(i18n, email, interest),
  });
  // The contact is already saved: a failed confirmation is logged, not shown as a failure.
  if (confirmError) console.error("Confirmation email failed:", confirmError.message);

  return json({ success: true, kind: beta ? "beta" : interest ? "interest" : "waitlist" });
}
