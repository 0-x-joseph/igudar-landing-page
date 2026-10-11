import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { INDICATIVE_NOTICE, formatMad, scenarioLabel } from "@/lib/finance";
import {
  BETA_TICKET_BUCKET_LABELS,
  parseBetaApplication,
  parseInterestPayload,
  type BetaApplication,
  type Interest,
} from "@/lib/waitlist-validation";

// ── Resend client ──────────────────────────────────────────
// Created lazily, inside the handler: `new Resend(undefined)` throws at module load,
// which would break `next build` ("Collecting page data") when RESEND_API_KEY is unset.
function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Simple file-based storage ──────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

interface WaitlistEntry {
  email: string;
  joinedAt: string;
  ip: string;
  /** Non-binding stated interest from the simulator, with the consent timestamp. */
  interest?: Interest;
  /** Closed-beta application, with the consent timestamp. */
  beta?: BetaApplication;
}

function getWaitlist(): WaitlistEntry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WAITLIST_FILE)) {
      fs.writeFileSync(WAITLIST_FILE, "[]", "utf-8");
      return [];
    }
    const raw = fs.readFileSync(WAITLIST_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveWaitlist(entries: WaitlistEntry[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf-8");
    return true;
  } catch (error) {
    // Storage is best-effort. On read-only/ephemeral filesystems (e.g. Vercel)
    // this write will fail — but the confirmation email has already been sent,
    // so we must not turn this into a 500 for the user.
    console.error("Failed to persist waitlist entry:", error);
    return false;
  }
}

// ── Rate limiter (in-memory, per IP) ───────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3;            // max 3 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// ── Email validation ───────────────────────────────────────
function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return false;
  // Block disposable/temp email domains
  const blockedDomains = [
    "tempmail.com", "throwaway.email", "guerrillamail.com",
    "mailinator.com", "yopmail.com", "10minutemail.com",
    "trashmail.com", "fakeinbox.com", "sharklasers.com",
    "guerrillamailblock.com", "grr.la", "dispostable.com",
    "maildrop.cc", "temp-mail.org", "getnada.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return !blockedDomains.includes(domain);
}

// ── Confirmation email HTML ────────────────────────────────
function buildConfirmationEmail(email: string, interest: Interest | null): string {
  const interestBlock = interest
    ? `
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">YOUR NON-BINDING INTEREST</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${formatMad(interest.amountMad, { decimals: 0 })}, ${scenarioLabel(interest.scenario)} scenario</p>
            <p style="font-size:12px;color:#888;margin:8px 0 0;">Indicative only. No money is collected and nothing is committed before the AMMC licence.</p>
          </div>`
    : "";
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="padding:40px 32px 20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IGUDAR</div>
          <div style="width:40px;height:3px;background:#5D18E9;border-radius:2px;margin:16px auto 0;"></div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:16px 32px 32px;">
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 12px;text-align:center;">
            You're on the waitlist! 🎉
          </h1>
          <p style="font-size:15px;color:#888;line-height:1.6;margin:0 0 24px;text-align:center;">
            Thank you for joining the IGUDAR waitlist. We're building a clearer way to own a share of rented Moroccan property, and we'll write to you as it takes shape.
          </p>
          
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">YOUR EMAIL</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${email}</p>
          </div>

${interestBlock}
          <p style="font-size:14px;color:#888;line-height:1.6;margin:0 0 8px;text-align:center;">
            <strong style="color:#fff;">What happens next?</strong>
          </p>
          <ul style="font-size:14px;color:#888;line-height:1.8;padding-left:20px;margin:0 0 24px;">
            <li>We'll write to you when there is news about the platform</li>
            <li>Joining the waitlist is not a commitment, and no money is collected</li>
            <li>You can ask us to remove your email at any time</li>
          </ul>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="font-size:12px;color:#555;margin:0;">
            © 2025 IGUDAR. ${INDICATIVE_NOTICE}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Beta application email HTML ────────────────────────────
function buildBetaEmail(application: BetaApplication): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7F5EF;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5EF;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border:1px solid #E2DDD2;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px 8px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#17131F;letter-spacing:-0.5px;">IGUDAR</div>
          <div style="width:40px;height:3px;background:#5D18E9;border-radius:2px;margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;">
          <h1 style="font-size:22px;font-weight:700;color:#17131F;margin:0 0 12px;text-align:center;">
            Thanks, ${escapeHtml(application.firstName)}. We received your application.
          </h1>
          <p style="font-size:15px;color:#615D6E;line-height:1.6;margin:0 0 20px;">
            A founder reviews every application by hand. You'll hear from us by email.
          </p>
          <p style="font-size:14px;color:#615D6E;line-height:1.7;margin:0 0 8px;"><strong style="color:#17131F;">What the beta is</strong></p>
          <ul style="font-size:14px;color:#615D6E;line-height:1.8;padding-left:20px;margin:0 0 20px;">
            <li>A closed test with about 50 people, using demo money only</li>
            <li>No real money is collected, and nothing is committed</li>
            <li>The simulation can run faster than real time, and you'll always see which mode is on</li>
          </ul>
          <p style="font-size:12px;color:#615D6E;line-height:1.6;margin:0;">${INDICATIVE_NOTICE}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Heads-up to the team for a beta application (no-op unless WAITLIST_NOTIFY_TO is set). */
async function notifyTeamBeta(resend: Resend, email: string, application: BetaApplication): Promise<void> {
  const notifyTo = process.env.WAITLIST_NOTIFY_TO;
  if (!notifyTo) return;
  const { error } = await resend.emails.send({
    from: `IGUDAR <waitlist@contact.igudar.tech>`,
    to: [notifyTo],
    subject: `Beta application: ${application.firstName}, ${application.location}`,
    text: `${email}
${application.firstName}, ${application.location}
Amount range: ${BETA_TICKET_BUCKET_LABELS[application.ticketBucket]}
Experience: ${application.experience}
Source: ${application.source}
Consent: ${application.consentAt}`,
  });
  if (error) console.error("Team notification failed:", JSON.stringify(error));
}

/** Optional heads-up to the team when someone states an amount (no-op unless WAITLIST_NOTIFY_TO is set). */
async function notifyTeam(resend: Resend, email: string, interest: Interest): Promise<void> {
  const notifyTo = process.env.WAITLIST_NOTIFY_TO;
  if (!notifyTo) return;
  const { error } = await resend.emails.send({
    from: `IGUDAR <waitlist@contact.igudar.tech>`,
    to: [notifyTo],
    subject: `Simulator interest: ${formatMad(interest.amountMad, { decimals: 0 })} (${scenarioLabel(interest.scenario)})`,
    text: `${email}
${formatMad(interest.amountMad, { decimals: 0 })}, ${scenarioLabel(interest.scenario)}
Source: ${interest.source}
Consent: ${interest.consentAt}`,
  });
  if (error) console.error("Team notification failed:", JSON.stringify(error));
}

// ── POST handler ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, honeypot } = body;

    // Honeypot check (spam bots fill hidden fields)
    if (honeypot) {
      // Silently accept but do nothing — fool the bot
      return NextResponse.json({ success: true });
    }

    // Optional simulator interest (amount, scenario, consent timestamp, source)
    const interestResult = parseInterestPayload(body);
    if (!interestResult.ok) {
      return NextResponse.json({ error: interestResult.error }, { status: 400 });
    }
    const interest = interestResult.value;

    // Optional closed-beta application (source: "beta")
    const betaResult = parseBetaApplication(body);
    if (!betaResult.ok) {
      return NextResponse.json({ error: betaResult.error }, { status: 400 });
    }
    const beta = betaResult.value;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Check for duplicates
    const waitlist = getWaitlist();
    const existing = waitlist.find((entry) => entry.email === normalizedEmail);

    // Already on the list and now applying for the beta: keep the latest application.
    if (existing && beta) {
      existing.beta = beta;
      saveWaitlist(waitlist);
      await notifyTeamBeta(getResend(), normalizedEmail, beta);
      return NextResponse.json({
        success: true,
        message: "Thanks, a founder reviews every application by hand. You'll hear from us by email.",
      });
    }

    if (existing && !interest) {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    // Already on the list and now stating an amount: keep the latest stated interest.
    if (existing && interest) {
      existing.interest = interest;
      saveWaitlist(waitlist);
      await notifyTeam(getResend(), normalizedEmail, interest);
      return NextResponse.json({
        success: true,
        message: "Thank you, we noted your interest.",
      });
    }

    // Send confirmation email via Resend
    const resend = getResend();
    const { error: emailError } = await resend.emails.send({
      from: `IGUDAR <waitlist@contact.igudar.tech>`,
      to: [normalizedEmail],
      subject: beta ? "We received your IGUDAR beta application" : "Welcome to the IGUDAR Waitlist! 🏠",
      html: beta ? buildBetaEmail(beta) : buildConfirmationEmail(normalizedEmail, interest),
    });

    if (emailError) {
      console.error("Resend error:", JSON.stringify(emailError, null, 2));
      return NextResponse.json(
        { error: `Email failed: ${emailError.message || "Unknown error"}. Check server logs.` },
        { status: 500 }
      );
    }

    // Save to waitlist
    waitlist.push({
      email: normalizedEmail,
      joinedAt: new Date().toISOString(),
      ip,
      ...(interest ? { interest } : {}),
      ...(beta ? { beta } : {}),
    });
    saveWaitlist(waitlist);

    if (interest) await notifyTeam(resend, normalizedEmail, interest);
    if (beta) await notifyTeamBeta(resend, normalizedEmail, beta);

    return NextResponse.json({
      success: true,
      message: beta
        ? "Thanks, a founder reviews every application by hand. You'll hear from us by email."
        : "You're on the list! Check your email for confirmation.",
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ── GET handler — return waitlist count ────────────────────
export async function GET() {
  const waitlist = getWaitlist();
  return NextResponse.json({ count: waitlist.length });
}
