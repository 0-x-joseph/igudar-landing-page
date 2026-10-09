/**
 * Validation of the optional simulator-interest fields on the waitlist payload.
 * Pure (no I/O) so it can be unit-tested without Resend. The email itself is
 * validated by the route handler.
 */
import { SCENARIO_KEYS, type ScenarioKey } from "@/lib/finance";

export const INTEREST_SOURCES = ["simulator", "hero", "calculator"] as const;
export type InterestSource = (typeof INTEREST_SOURCES)[number];

export interface Interest {
  amountMad: number;
  scenario: ScenarioKey;
  /** ISO timestamp of the moment the visitor ticked the consent box. */
  consentAt: string;
  source: InterestSource;
}

export type InterestParse =
  | { ok: true; value: Interest | null }
  | { ok: false; error: string };

const MAX_AMOUNT_MAD = 10_000_000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Returns `value: null` when none of the interest fields are present (a plain
 * waitlist signup). When any is present, amount, scenario, source and a valid
 * consent timestamp are all required.
 */
export function parseInterestPayload(body: unknown, now: Date = new Date()): InterestParse {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request." };
  }
  const { amountMad, scenario, consentAt, source } = body as Record<string, unknown>;

  const present = [amountMad, scenario, consentAt, source].some((v) => v !== undefined && v !== null);
  if (!present) return { ok: true, value: null };

  if (typeof amountMad !== "number" || !Number.isFinite(amountMad) || amountMad <= 0 || amountMad > MAX_AMOUNT_MAD) {
    return { ok: false, error: "Please provide a valid amount." };
  }
  if (typeof scenario !== "string" || !(SCENARIO_KEYS as readonly string[]).includes(scenario)) {
    return { ok: false, error: "Unknown scenario." };
  }
  if (typeof source !== "string" || !(INTEREST_SOURCES as readonly string[]).includes(source)) {
    return { ok: false, error: "Unknown source." };
  }
  if (typeof consentAt !== "string") {
    return { ok: false, error: "Consent is required." };
  }
  const consentDate = new Date(consentAt);
  if (Number.isNaN(consentDate.getTime()) || consentDate.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    return { ok: false, error: "Consent timestamp is invalid." };
  }

  return {
    ok: true,
    value: {
      amountMad,
      scenario: scenario as ScenarioKey,
      consentAt: consentDate.toISOString(),
      source: source as InterestSource,
    },
  };
}
