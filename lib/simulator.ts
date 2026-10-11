/**
 * Small, pure helpers for the simulator UI (input clamping, analytics buckets).
 * No financial maths here: every figure comes from lib/finance.
 */
import {
  FEE_GRID,
  LIMITS,
  MODEL_SCENARIOS,
  TAX,
  formatMad,
  formatPercent,
  type FeeLine,
  type ScenarioKey,
} from "@/lib/finance";

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

/** One-line summary of a scenario's assumptions, read from MODEL_SCENARIOS. */
export function scenarioDescription(key: ScenarioKey): string {
  const a = MODEL_SCENARIOS[key];
  const parts = [
    `${formatPercent(a.grossYield, 2)} gross rental yield`,
    a.vacancy > 0 ? `${formatPercent(a.vacancy, 0)} vacancy or operator default` : "no vacancy",
    `${formatPercent(a.rentReserve, 0)} rent reserve`,
    `property price ${a.priceGrowth > 0 ? `+${formatPercent(a.priceGrowth)}` : "flat"}${a.priceGrowth > 0 ? "/yr" : ""}`,
  ];
  if (a.rentIndexation > 0) parts.push(`rent indexed ${formatPercent(a.rentIndexation, 0)}/yr`);
  if (a.sellerCostsAtExit > 0) parts.push(`${formatPercent(a.sellerCostsAtExit, 0)} seller-side costs at exit`);
  return parts.join(" · ");
}

/** "1.17×". A null multiple is shown as an em dash. */
export function formatMultiple(multiple: number): string {
  if (!Number.isFinite(multiple)) return "—";
  return `${multiple.toFixed(2)}×`;
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
