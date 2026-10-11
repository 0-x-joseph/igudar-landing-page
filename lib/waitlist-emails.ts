/**
 * Email bodies for the waitlist and closed-beta flows. Pure functions (no I/O) so the route
 * stays small and the templates can be tested.
 */
import { INDICATIVE_NOTICE, formatMad, scenarioLabel } from "@/lib/finance";
import {
  BETA_EXPERIENCE_LABELS,
  BETA_TICKET_BUCKET_LABELS,
  type BetaApplication,
  type Interest,
} from "@/lib/waitlist-validation";

export const REGISTER_URL = "https://app.igudar.tech/auth/register";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain waitlist confirmation, with the stated interest when there is one. */
export function buildConfirmationEmail(email: string, interest: Interest | null): string {
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
        <tr><td style="padding:40px 32px 20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IGUDAR</div>
          <div style="width:40px;height:3px;background:#5D18E9;border-radius:2px;margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;">
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 12px;text-align:center;">
            You're on the waitlist
          </h1>
          <p style="font-size:15px;color:#aaa;line-height:1.6;margin:0 0 24px;text-align:center;">
            Thank you for joining the IGUDAR waitlist. We're building a clearer way to own a share of rented Moroccan property, and we'll write to you as it takes shape.
          </p>
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">YOUR EMAIL</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${escapeHtml(email)}</p>
          </div>
${interestBlock}
          <p style="font-size:14px;color:#aaa;line-height:1.6;margin:0 0 8px;text-align:center;">
            <strong style="color:#fff;">What happens next?</strong>
          </p>
          <ul style="font-size:14px;color:#aaa;line-height:1.8;padding-left:20px;margin:0 0 24px;">
            <li>We'll write to you when there is news about the platform</li>
            <li>Joining the waitlist is not a commitment, and no money is collected</li>
            <li>You can ask us to remove your email at any time</li>
          </ul>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="font-size:12px;color:#999;margin:0;">${INDICATIVE_NOTICE}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Confirmation to a beta applicant: what happens next, and where to create the account once approved. */
export function buildBetaEmail(application: BetaApplication): string {
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
            A founder reviews every application by hand. When you are approved, you'll get an email with your access.
            Once approved, create your account here: <a href="${REGISTER_URL}" style="color:#5D18E9;">${REGISTER_URL}</a>
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

/** Plain-text heads-up to the team for a beta application: the answers live here, not on disk. */
export function buildBetaNotification(email: string, a: BetaApplication): string {
  return [
    email,
    `${a.firstName}, ${a.location}`,
    `Amount range: ${BETA_TICKET_BUCKET_LABELS[a.ticketBucket]}`,
    `Experience: ${a.experience} (${BETA_EXPERIENCE_LABELS[a.experience]})`,
    `Source: ${a.source}`,
    `Consent: ${a.consentAt}`,
  ].join("\n");
}

/** Plain-text heads-up to the team when someone states an amount in the simulator. */
export function buildInterestNotification(email: string, i: Interest): string {
  return [
    email,
    `${formatMad(i.amountMad, { decimals: 0 })}, ${scenarioLabel(i.scenario)}`,
    `Source: ${i.source}`,
    `Consent: ${i.consentAt}`,
  ].join("\n");
}
