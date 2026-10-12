import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/routing";
import {
  WAITLIST_ERROR_CODES,
  isWaitlistErrorCode,
  parseBetaApplication,
  parseInterestPayload,
} from "@/lib/waitlist-validation";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

const NOW = new Date("2026-10-09T12:00:00.000Z");
const valid = {
  amountMad: 25_000,
  scenario: "base",
  consentAt: "2026-10-09T11:59:00.000Z",
  source: "simulator",
};

describe("parseInterestPayload", () => {
  it("accepts a plain email-only payload (backwards compatible)", () => {
    expect(parseInterestPayload({ email: "a@b.co" }, NOW)).toEqual({ ok: true, value: null });
  });

  it("accepts a full simulator payload", () => {
    const r = parseInterestPayload(valid, NOW);
    expect(r).toEqual({
      ok: true,
      value: {
        amountMad: 25_000,
        scenario: "base",
        consentAt: "2026-10-09T11:59:00.000Z",
        source: "simulator",
      },
    });
  });

  it("requires consent when an amount is sent", () => {
    const r = parseInterestPayload({ ...valid, consentAt: undefined }, NOW);
    expect(r).toEqual({ ok: false, error: "consent_required" });
  });

  it.each([
    ["negative amount", { amountMad: -1 }, "amount_out_of_range"],
    ["zero amount", { amountMad: 0 }, "amount_out_of_range"],
    ["string amount", { amountMad: "25000" }, "amount_out_of_range"],
    ["NaN amount", { amountMad: Number.NaN }, "amount_out_of_range"],
    ["Infinity", { amountMad: Infinity }, "amount_out_of_range"],
    ["absurd amount", { amountMad: 1e12 }, "amount_out_of_range"],
    ["unknown scenario", { scenario: "moon" }, "unknown_scenario"],
    ["prototype scenario", { scenario: "toString" }, "unknown_scenario"],
    ["unknown source", { source: "pirate" }, "unknown_source"],
    ["garbage consent date", { consentAt: "yesterday-ish" }, "consent_invalid"],
    ["consent far in the future", { consentAt: "2027-01-01T00:00:00.000Z" }, "consent_invalid"],
    ["non-string consent", { consentAt: 12345 }, "consent_required"],
  ])("rejects %s with a stable code", (_name, patch, code) => {
    expect(parseInterestPayload({ ...valid, ...patch }, NOW)).toEqual({ ok: false, error: code });
  });

  it("rejects a non-object body", () => {
    expect(parseInterestPayload(null, NOW)).toEqual({ ok: false, error: "invalid_request" });
    expect(parseInterestPayload("x", NOW)).toEqual({ ok: false, error: "invalid_request" });
  });

  it("ignores unrelated fields such as the honeypot and email", () => {
    const r = parseInterestPayload({ email: "a@b.co", honeypot: "", extra: 1 }, NOW);
    expect(r).toEqual({ ok: true, value: null });
  });
});

const betaValid = {
  email: "a@b.co",
  source: "beta",
  firstName: "Salma",
  location: "Casablanca, Morocco",
  ticketBucket: "25-50k",
  experience: "some",
  consentAt: "2026-10-09T11:59:00.000Z",
};

describe("parseInterestPayload with the beta source", () => {
  it("leaves beta payloads to parseBetaApplication", () => {
    expect(parseInterestPayload(betaValid, NOW)).toEqual({ ok: true, value: null });
  });
});

describe("parseBetaApplication", () => {
  it("returns null for any non-beta payload", () => {
    expect(parseBetaApplication({ email: "a@b.co" }, NOW)).toEqual({ ok: true, value: null });
    expect(parseBetaApplication(valid, NOW)).toEqual({ ok: true, value: null });
  });

  it("accepts a full application", () => {
    expect(parseBetaApplication(betaValid, NOW)).toEqual({
      ok: true,
      value: {
        firstName: "Salma",
        location: "Casablanca, Morocco",
        ticketBucket: "25-50k",
        experience: "some",
        consentAt: "2026-10-09T11:59:00.000Z",
        source: "beta",
      },
    });
  });

  it("trims, collapses whitespace and strips angle brackets and control characters", () => {
    const r = parseBetaApplication(
      { ...betaValid, firstName: "  Sal<b>ma \n ", location: "Paris,\tFrance" },
      NOW,
    );
    expect(r.ok && r.value?.firstName).toBe("Sal b ma");
    expect(r.ok && r.value?.location).toBe("Paris, France");
  });

  it("keeps unicode names intact", () => {
    const r = parseBetaApplication({ ...betaValid, firstName: "Yassine أمين" }, NOW);
    expect(r.ok && r.value?.firstName).toBe("Yassine أمين");
  });

  it.each([
    ["missing name", { firstName: undefined }, "first_name_required"],
    ["blank name", { firstName: "   " }, "first_name_required"],
    ["numeric name", { firstName: 12 }, "first_name_required"],
    ["name over 60 characters", { firstName: "x".repeat(61) }, "first_name_required"],
    ["missing location", { location: "" }, "location_required"],
    ["location over 80 characters", { location: "x".repeat(81) }, "location_required"],
    ["unknown bucket", { ticketBucket: "1-5k" }, "ticket_bucket_required"],
    ["prototype bucket", { ticketBucket: "toString" }, "ticket_bucket_required"],
    ["unknown experience", { experience: "wizard" }, "experience_required"],
    ["missing consent", { consentAt: undefined }, "consent_required"],
    ["non-string consent", { consentAt: true }, "consent_required"],
    ["garbage consent date", { consentAt: "soon" }, "consent_invalid"],
    ["consent far in the future", { consentAt: "2027-01-01T00:00:00.000Z" }, "consent_invalid"],
  ])("rejects %s with a stable code", (_name, patch, code) => {
    expect(parseBetaApplication({ ...betaValid, ...patch }, NOW)).toEqual({ ok: false, error: code });
  });

  it("rejects a non-object body", () => {
    expect(parseBetaApplication(null, NOW)).toEqual({ ok: false, error: "invalid_request" });
    expect(parseBetaApplication("beta", NOW)).toEqual({ ok: false, error: "invalid_request" });
  });
});

describe("error codes", () => {
  it("are recognised by the guard, and nothing else is", () => {
    for (const code of WAITLIST_ERROR_CODES) expect(isWaitlistErrorCode(code)).toBe(true);
    expect(isWaitlistErrorCode("Please provide a valid email address.")).toBe(false);
    expect(isWaitlistErrorCode(undefined)).toBe(false);
    expect(isWaitlistErrorCode("toString")).toBe(false);
  });

  it.each(LOCALES)("each has a sentence under beta.errors in %s", (locale) => {
    const file = path.join(ROOT, "messages", locale, "beta.json");
    const { errors } = JSON.parse(readFileSync(file, "utf8")) as { errors: Record<string, unknown> };
    for (const code of WAITLIST_ERROR_CODES) {
      expect(typeof errors[code], `${locale}: beta.errors.${code}`).toBe("string");
      expect((errors[code] as string).trim()).not.toBe("");
    }
    // No stale sentence for a code that no longer exists.
    expect(Object.keys(errors).sort()).toEqual([...WAITLIST_ERROR_CODES].sort());
  });
});
