import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

// ── Resend client ──────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Simple file-based storage ──────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

interface WaitlistEntry {
  email: string;
  joinedAt: string;
  ip: string;
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
function buildConfirmationEmail(email: string): string {
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
            Thank you for joining the Igudar waitlist. We're building the smartest way to invest in Moroccan real estate — and you'll be among the first to access it.
          </p>
          
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">YOUR EMAIL</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${email}</p>
          </div>

          <p style="font-size:14px;color:#888;line-height:1.6;margin:0 0 8px;text-align:center;">
            <strong style="color:#fff;">What happens next?</strong>
          </p>
          <ul style="font-size:14px;color:#888;line-height:1.8;padding-left:20px;margin:0 0 24px;">
            <li>We'll notify you as soon as early access opens</li>
            <li>You'll get priority access to investment opportunities</li>
            <li>Exclusive updates on our launch progress</li>
          </ul>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="font-size:12px;color:#555;margin:0;">
            © 2025 IGUDAR. Democratizing real estate investment in Morocco.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
    const alreadyExists = waitlist.some(
      (entry) => entry.email === normalizedEmail
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    // Send confirmation email via Resend
    const { error: emailError } = await resend.emails.send({
      from: `IGUDAR <waitlist@contact.igudar.tech>`,
      to: [normalizedEmail],
      subject: "Welcome to the IGUDAR Waitlist! 🏠",
      html: buildConfirmationEmail(normalizedEmail),
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
    });
    saveWaitlist(waitlist);

    return NextResponse.json({
      success: true,
      message: "You're on the list! Check your email for confirmation.",
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
