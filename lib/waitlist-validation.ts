/**
 * Validation of the optional simulator-interest fields on the waitlist payload.
 * Pure (no I/O) so it can be unit-tested without Resend. The email itself is
 * validated by the route handler.
 */
import { LIMITS, SCENARIO_KEYS, formatMad, type ScenarioKey } from "@/lib/finance";

export const INTEREST_SOURCES = ["simulator", "hero", "calculator", "beta"] as const;
export type InterestSource = (typeof INTEREST_SOURCES)[number];

export interface Interest {
  amountMad: number;
  scenario: ScenarioKey;
  /** ISO timestamp of the moment the visitor ticked the consent box. */
  consentAt: string;
  source: InterestSource;
}

/**
 * Every error the waitlist flow can answer with, as a stable code. The UI shows `beta.errors.<code>`
 * in the visitor's language; `lib/__tests__/waitlist-validation.test.ts` checks each code has a message.
 */
export const WAITLIST_ERROR_CODES = [
  "invalid_request",
  "invalid_email",
  "amount_out_of_range",
  "unknown_scenario",
  "unknown_source",
  "consent_required",
  "consent_invalid",
  "first_name_required",
  "location_required",
  "ticket_bucket_required",
  "experience_required",
  "not_configured",
  "rate_limited",
  "save_failed",
  "application_failed",
] as const;
export type WaitlistErrorCode = (typeof WAITLIST_ERROR_CODES)[number];

export function isWaitlistErrorCode(value: unknown): value is WaitlistErrorCode {
  return typeof value === "string" && (WAITLIST_ERROR_CODES as readonly string[]).includes(value);
}

export type InterestParse =
  | { ok: true; value: Interest | null }
  | { ok: false; error: WaitlistErrorCode };

const MAX_AMOUNT_MAD = 10_000_000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Returns `value: null` when none of the interest fields are present (a plain
 * waitlist signup). When any is present, amount, scenario, source and a valid
 * consent timestamp are all required.
 */
export function parseInterestPayload(body: unknown, now: Date = new Date()): InterestParse {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "invalid_request" };
  }
  const { amountMad, scenario, consentAt, source } = body as Record<string, unknown>;

  // Beta applications carry their own fields and are validated by parseBetaApplication.
  if (source === "beta") return { ok: true, value: null };

  const present = [amountMad, scenario, consentAt, source].some((v) => v !== undefined && v !== null);
  if (!present) return { ok: true, value: null };

  if (typeof amountMad !== "number" || !Number.isFinite(amountMad) || amountMad <= 0 || amountMad > MAX_AMOUNT_MAD) {
    return { ok: false, error: "amount_out_of_range" };
  }
  if (typeof scenario !== "string" || !(SCENARIO_KEYS as readonly string[]).includes(scenario)) {
    return { ok: false, error: "unknown_scenario" };
  }
  if (typeof source !== "string" || !(INTEREST_SOURCES as readonly string[]).includes(source)) {
    return { ok: false, error: "unknown_source" };
  }
  if (typeof consentAt !== "string") {
    return { ok: false, error: "consent_required" };
  }
  const consentDate = new Date(consentAt);
  if (Number.isNaN(consentDate.getTime()) || consentDate.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    return { ok: false, error: "consent_invalid" };
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

// ── Closed-beta application ────────────────────────────────

export const BETA_TICKET_BUCKETS = ["25-50k", "50-100k", "100-250k", "250k-plus", "not-sure"] as const;
export type BetaTicketBucket = (typeof BETA_TICKET_BUCKETS)[number];

/**
 * English labels for the team notification. Visitors see `beta.form.buckets.*` in their language.
 * The first bucket starts at the minimum ticket, read from the constants.
 */
export const BETA_TICKET_BUCKET_LABELS: Record<BetaTicketBucket, string> = {
  "25-50k": `${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} to 50,000 MAD`,
  "50-100k": "50,000 to 100,000 MAD",
  "100-250k": "100,000 to 250,000 MAD",
  "250k-plus": "More than 250,000 MAD",
  "not-sure": "Not sure yet",
};

export const BETA_EXPERIENCE_LEVELS = ["new", "some", "experienced"] as const;
export type BetaExperience = (typeof BETA_EXPERIENCE_LEVELS)[number];

/** English labels for the team notification. Visitors see `beta.form.experience.*`. */
export const BETA_EXPERIENCE_LABELS: Record<BetaExperience, string> = {
  new: "New to this",
  some: "Some experience (savings products, a rental, or a first look)",
  experienced: "Experienced (I own or invest in property or funds)",
};

export interface BetaApplication {
  firstName: string;
  /** City and country, free text. */
  location: string;
  ticketBucket: BetaTicketBucket;
  experience: BetaExperience;
  /** ISO timestamp of the moment the applicant ticked the consent box. */
  consentAt: string;
  source: "beta";
}

export type BetaParse =
  | { ok: true; value: BetaApplication | null }
  | { ok: false; error: WaitlistErrorCode };

const MAX_NAME = 60;
const MAX_LOCATION = 80;

/** Trims, collapses whitespace and replaces control characters and angle brackets. Null for non-strings. */
function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Returns `value: null` unless `source` is "beta". For a beta application the first name, location,
 * ticket bucket, experience level and a valid consent timestamp are all required.
 */
export function parseBetaApplication(body: unknown, now: Date = new Date()): BetaParse {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "invalid_request" };
  }
  const { source, firstName, location, ticketBucket, experience, consentAt } = body as Record<string, unknown>;
  if (source !== "beta") return { ok: true, value: null };

  const name = cleanText(firstName);
  if (!name || name.length > MAX_NAME) {
    return { ok: false, error: "first_name_required" };
  }
  const place = cleanText(location);
  if (!place || place.length > MAX_LOCATION) {
    return { ok: false, error: "location_required" };
  }
  if (typeof ticketBucket !== "string" || !(BETA_TICKET_BUCKETS as readonly string[]).includes(ticketBucket)) {
    return { ok: false, error: "ticket_bucket_required" };
  }
  if (typeof experience !== "string" || !(BETA_EXPERIENCE_LEVELS as readonly string[]).includes(experience)) {
    return { ok: false, error: "experience_required" };
  }
  if (typeof consentAt !== "string") {
    return { ok: false, error: "consent_required" };
  }
  const consentDate = new Date(consentAt);
  if (Number.isNaN(consentDate.getTime()) || consentDate.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    return { ok: false, error: "consent_invalid" };
  }

  return {
    ok: true,
    value: {
      firstName: name,
      location: place,
      ticketBucket: ticketBucket as BetaTicketBucket,
      experience: experience as BetaExperience,
      consentAt: consentDate.toISOString(),
      source: "beta",
    },
  };
}
