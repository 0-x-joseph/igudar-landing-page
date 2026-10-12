/**
 * Small, pure helpers for the simulator UI (input clamping, parsing, analytics buckets).
 * No financial maths here: every figure comes from lib/finance.
 */
import { FEE_GRID, LIMITS, TAX, formatMad, formatPercent, type FeeLine } from "@/lib/finance";

/** Ticket the slider and input start on. */
export const DEFAULT_TICKET_MAD: number = LIMITS.MIN_TICKET_MAD;

/**
 * Snaps a typed or dragged amount to the 5,000 step and keeps it between the
 * 25,000 minimum and `max`. Business angels are not capped per project (art. 44),
 * so the default maximum is the size of the raise, which a ticket cannot exceed.
 */
export function clampTicket(value: number, opts: { max?: number } = {}): number {
  const max = opts.max ?? LIMITS.MAX_RAISE_MAD;
  if (!Number.isFinite(value)) return LIMITS.MIN_TICKET_MAD;
  const stepped = Math.round(value / LIMITS.TICKET_STEP_MAD) * LIMITS.TICKET_STEP_MAD;
  return Math.min(max, Math.max(LIMITS.MIN_TICKET_MAD, stepped));
}

/** One step up (+1) or down (-1), clamped. */
export function stepTicket(current: number, direction: 1 | -1, opts: { max?: number } = {}): number {
  return clampTicket(current + direction * LIMITS.TICKET_STEP_MAD, opts);
}

/** Coarse bucket for analytics: events never carry the exact amount. */
export function ticketBucket(amountMad: number): string {
  if (amountMad < 50_000) return "25-45k";
  if (amountMad < 100_000) return "50-95k";
  if (amountMad < 250_000) return "100-245k";
  if (amountMad <= LIMITS.MAX_PER_PROJECT_MAD) return "250-500k";
  return "500k+";
}

const ARABIC_INDIC_ZERO = 0x0660; // ٠
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0; // ۰ (Persian keyboards)

/** Maps Arabic-Indic digits (٠-٩, ۰-۹) to 0-9; everything else is returned as is. */
function westernDigits(text: string): string {
  return text.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    const zero = code >= EXTENDED_ARABIC_INDIC_ZERO ? EXTENDED_ARABIC_INDIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - zero);
  });
}

/**
 * Reads an amount the way people type it in any of the site's languages: "25000", "25 000",
 * "25.000", "25,000", "٢٥٠٠٠", "1 250 000,50". Spaces of every kind are ignored; a point or a comma
 * followed by exactly three digits is a thousands separator, any other one is the decimal mark.
 * Returns NaN when nothing numeric was typed, so callers can fall back to the minimum.
 */
export function parseAmount(text: string): number {
  let s = westernDigits(text)
    .replace(/[\s    ٬']/g, "") // spaces, NBSP, thin spaces, Arabic thousands sign, apostrophes
    .replace(/٫/g, ",") // Arabic decimal separator
    .replace(/[^\d.,-]/g, ""); // currency words and anything else
  if (s === "" || !/\d/.test(s)) return Number.NaN;
  // Grouping marks: a point or comma followed by exactly three digits and then another mark or the end.
  s = s.replace(/[.,](?=\d{3}(?:[.,]|$))/g, "");
  // What is left of "." or "," is a decimal mark.
  s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Rate column of the public fee grid, in plain words. */
export function feeRateText(line: FeeLine): string {
  switch (line.code) {
    case "S1":
    case "S2":
      return `${formatPercent(line.rate)} of capital raised`;
    case "D1":
      return formatPercent(line.rate, 0);
    case "D2":
      return `${formatPercent(line.rate, 2)}/yr of capital, HT (${formatPercent(
        line.rate * (1 + TAX.TVA_ON_FEES),
        2,
      )} incl. TVA)`;
    case "D3":
      return `${formatPercent(line.rate)} of sale value, HT`;
    case "D4":
      return `${formatPercent(line.rate)} of the amount traded`;
    case "D5":
      return `${formatPercent(line.rate, 0)} of the gain above a ${formatPercent(FEE_GRID.D5_HURDLE, 0)}/yr hurdle`;
    default: {
      const d = FEE_GRID.D6_ANALYTICS_MAD;
      return `${formatMad(d.individual, { decimals: 0 })} or ${formatMad(d.premium, { decimals: 0 })}/yr (business ${formatMad(d.b2b, { decimals: 0 })})`;
    }
  }
}
