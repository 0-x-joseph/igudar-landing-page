import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatMad } from "@/lib/finance";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/routing";
import { parseBetaApplication, parseInterestPayload, type WaitlistErrorCode } from "@/lib/waitlist-validation";
import { BetaStorageNotConfiguredError, saveBetaApplication } from "@/lib/supabase/beta-applications";
import {
  buildBetaEmail,
  buildBetaNotification,
  buildConfirmationEmail,
  buildInterestNotification,
  emailI18nFor,
} from "@/lib/waitlist-emails";

/**
 * Beta answers are saved in Supabase before any optional email work. Other
 * sign-ups retain the Resend Audience flow. Stable error codes and localized
 * confirmations are shared by all four languages; no PII is logged.
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

// In-memory, per instance. An IP is never persisted or logged.
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

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) return fail("rate_limited", 429);

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return fail("invalid_request", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid_request", 400);
  }

  // Bots get a success response without a database write or email.
  if (body.honeypot) return json({ success: true });

  const interestResult = parseInterestPayload(body);
  if (!interestResult.ok) return fail(interestResult.error, 400);
  const betaResult = parseBetaApplication(body);
  if (!betaResult.ok) return fail(betaResult.error, 400);
  const interest = interestResult.value;
  const beta = betaResult.value;

  if (!body.email || typeof body.email !== "string") return fail("invalid_email", 400);
  const email = body.email.trim().toLowerCase();
  if (!isValidEmail(email) || (beta && email.length > 254)) return fail("invalid_email", 400);

  const locale: Locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const success = () => json({ success: true, kind: beta ? "beta" : interest ? "interest" : "waitlist" });

  if (beta) {
    try {
      const inserted = await saveBetaApplication(email, beta, locale);
      // A retry is a no-op: retain the original answers and do not resend mail.
      if (!inserted) return success();
    } catch (error) {
      if (error instanceof BetaStorageNotConfiguredError) return fail("not_configured", 503);
      console.error("Beta application storage failed.");
      return fail("application_failed", 502);
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  // Email is optional for a durably saved beta application, but remains the
  // storage mechanism for a plain waitlist signup or simulator interest.
  if (!apiKey) return beta ? success() : fail("not_configured", 503);

  try {
    await upsertContact(apiKey, email, beta?.firstName);
  } catch {
    console.error("Waitlist contact upsert failed.");
    if (!beta) return fail("save_failed", 502);
  }

  const resend = new Resend(apiKey);
  if (beta || interest) {
    try {
      const { error } = await resend.emails.send({
        from: mailFrom(),
        to: [notifyTo()],
        subject: beta
          ? `Beta application: ${beta.firstName}, ${beta.location}`
          : `Simulator interest: ${formatMad(interest!.amountMad, { decimals: 0 })}`,
        text: beta ? buildBetaNotification(email, beta) : buildInterestNotification(email, interest!),
      });
      if (error) console.error("Team notification failed.");
    } catch {
      console.error("Team notification failed.");
    }
  }

  try {
    const i18n = await emailI18nFor(locale);
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: [email],
      subject: beta ? i18n.t("beta.subject") : i18n.t("confirmation.subject"),
      html: beta ? buildBetaEmail(i18n, beta) : buildConfirmationEmail(i18n, email, interest),
    });
    if (error) console.error("Confirmation email failed.");
  } catch {
    console.error("Confirmation email failed.");
  }

  return success();
}
