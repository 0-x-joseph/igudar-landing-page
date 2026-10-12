/**
 * Email bodies for the waitlist and closed-beta flows. Pure functions (no I/O) so the route
 * stays small and the templates can be tested. The visitor's emails are rendered in their
 * language from `messages/<locale>/emails.json`; the team notifications stay in English.
 */
import { formatMad, scenarioLabel } from "@/lib/finance";
import { LOCALE_META, type Locale } from "@/i18n/routing";
import type { Formatters } from "@/lib/i18n/format";
import { translatorFor } from "@/lib/i18n/server";
import {
  BETA_EXPERIENCE_LABELS,
  BETA_TICKET_BUCKET_LABELS,
  type BetaApplication,
  type Interest,
} from "@/lib/waitlist-validation";

export const REGISTER_URL = "https://app.igudar.tech/auth/register";

/** `{ t, locale, format }` for the `emails` namespace; see `emailI18nFor`. */
export interface EmailI18n {
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: Locale;
  format: Formatters;
}

/**
 * `translatorFor(locale, "emails")` with `t` typed on plain string keys: the message files are
 * not declared to TypeScript, so the generic translator would otherwise accept no key at all.
 * Unknown locales fall back to English.
 */
export async function emailI18nFor(locale: unknown): Promise<EmailI18n> {
  const { t, locale: resolved, format } = await translatorFor(locale, "emails");
  return { t: t as unknown as EmailI18n["t"], locale: resolved, format };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** `lang`/`dir` for the document, and the physical side that "start" means, for email clients without logical properties. */
function direction(locale: EmailI18n["locale"]) {
  const dir = LOCALE_META[locale].dir;
  return { dir, start: dir === "rtl" ? "right" : "left" };
}

/** Plain waitlist confirmation, with the stated interest when there is one. */
export function buildConfirmationEmail({ t, locale, format }: EmailI18n, email: string, interest: Interest | null): string {
  const { dir, start } = direction(locale);
  const interestBlock = interest
    ? `
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;text-align:start;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">${escapeHtml(t("confirmation.interest.label"))}</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${escapeHtml(
              t("confirmation.interest.value", {
                amount: format.mad(interest.amountMad, { decimals: 0 }),
                scenario: t(`scenarios.${interest.scenario}`),
              }),
            )}</p>
            <p style="font-size:12px;color:#888;margin:8px 0 0;">${escapeHtml(t("confirmation.interest.note"))}</p>
          </div>`
    : "";
  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body dir="${dir}" style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" dir="${dir}" style="max-width:520px;background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px 20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IGUDAR</div>
          <div style="width:40px;height:3px;background:#5D18E9;border-radius:2px;margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;">
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 12px;text-align:center;">
            ${escapeHtml(t("confirmation.title"))}
          </h1>
          <p style="font-size:15px;color:#aaa;line-height:1.6;margin:0 0 24px;text-align:center;">
            ${escapeHtml(t("confirmation.intro"))}
          </p>
          <div style="background:rgba(93,24,233,0.06);border:1px solid rgba(93,24,233,0.15);border-radius:12px;padding:20px;margin:0 0 24px;text-align:start;">
            <p style="font-size:13px;color:#7B3FFF;font-weight:600;margin:0 0 4px;">${escapeHtml(t("confirmation.emailLabel"))}</p>
            <p style="font-size:15px;color:#ffffff;margin:0;">${escapeHtml(email)}</p>
          </div>
${interestBlock}
          <p style="font-size:14px;color:#aaa;line-height:1.6;margin:0 0 8px;text-align:center;">
            <strong style="color:#fff;">${escapeHtml(t("confirmation.nextTitle"))}</strong>
          </p>
          <ul style="font-size:14px;color:#aaa;line-height:1.8;padding-${start}:20px;padding-inline-start:20px;margin:0 0 24px;text-align:start;">
            <li>${escapeHtml(t("confirmation.next.news"))}</li>
            <li>${escapeHtml(t("confirmation.next.noCommitment"))}</li>
            <li>${escapeHtml(t("confirmation.next.remove"))}</li>
          </ul>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="font-size:12px;color:#999;margin:0;">${escapeHtml(t("notice"))}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Confirmation to a beta applicant: what happens next, and where to create the account once approved. */
export function buildBetaEmail({ t, locale }: EmailI18n, application: BetaApplication): string {
  const { dir, start } = direction(locale);
  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body dir="${dir}" style="margin:0;padding:0;background:#F7F5EF;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="background:#F7F5EF;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" dir="${dir}" style="max-width:520px;background:#ffffff;border:1px solid #E2DDD2;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px 8px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#17131F;letter-spacing:-0.5px;">IGUDAR</div>
          <div style="width:40px;height:3px;background:#5D18E9;border-radius:2px;margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;text-align:start;">
          <h1 style="font-size:22px;font-weight:700;color:#17131F;margin:0 0 12px;text-align:center;">
            ${escapeHtml(t("beta.title", { name: application.firstName }))}
          </h1>
          <p style="font-size:15px;color:#615D6E;line-height:1.6;margin:0 0 20px;text-align:start;">
            ${escapeHtml(t("beta.intro"))} <a href="${REGISTER_URL}" style="color:#5D18E9;">${REGISTER_URL}</a>
          </p>
          <p style="font-size:14px;color:#615D6E;line-height:1.7;margin:0 0 8px;text-align:start;"><strong style="color:#17131F;">${escapeHtml(t("beta.whatTitle"))}</strong></p>
          <ul style="font-size:14px;color:#615D6E;line-height:1.8;padding-${start}:20px;padding-inline-start:20px;margin:0 0 20px;text-align:start;">
            <li>${escapeHtml(t("beta.facts.closed"))}</li>
            <li>${escapeHtml(t("beta.facts.demo"))}</li>
            <li>${escapeHtml(t("beta.facts.clock"))}</li>
          </ul>
          <p style="font-size:12px;color:#615D6E;line-height:1.6;margin:0;text-align:start;">${escapeHtml(t("notice"))}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text heads-up to the team for a beta application: the answers live here, not on disk. English. */
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

/** Plain-text heads-up to the team when someone states an amount in the simulator. English. */
export function buildInterestNotification(email: string, i: Interest): string {
  return [
    email,
    `${formatMad(i.amountMad, { decimals: 0 })}, ${scenarioLabel(i.scenario)}`,
    `Source: ${i.source}`,
    `Consent: ${i.consentAt}`,
  ].join("\n");
}
