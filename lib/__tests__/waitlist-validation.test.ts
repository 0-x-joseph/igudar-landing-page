import { describe, expect, it } from "vitest";
import { parseBetaApplication, parseInterestPayload } from "@/lib/waitlist-validation";

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
    expect(r.ok).toBe(false);
  });

  it.each([
    ["negative amount", { amountMad: -1 }],
    ["zero amount", { amountMad: 0 }],
    ["string amount", { amountMad: "25000" }],
    ["NaN amount", { amountMad: Number.NaN }],
    ["Infinity", { amountMad: Infinity }],
    ["absurd amount", { amountMad: 1e12 }],
    ["unknown scenario", { scenario: "moon" }],
    ["prototype scenario", { scenario: "toString" }],
    ["unknown source", { source: "pirate" }],
    ["garbage consent date", { consentAt: "yesterday-ish" }],
    ["consent far in the future", { consentAt: "2027-01-01T00:00:00.000Z" }],
    ["non-string consent", { consentAt: 12345 }],
  ])("rejects %s", (_name, patch) => {
    expect(parseInterestPayload({ ...valid, ...patch }, NOW).ok).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(parseInterestPayload(null, NOW).ok).toBe(false);
    expect(parseInterestPayload("x", NOW).ok).toBe(false);
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
    ["missing name", { firstName: undefined }],
    ["blank name", { firstName: "   " }],
    ["numeric name", { firstName: 12 }],
    ["name over 60 characters", { firstName: "x".repeat(61) }],
    ["missing location", { location: "" }],
    ["location over 80 characters", { location: "x".repeat(81) }],
    ["unknown bucket", { ticketBucket: "1-5k" }],
    ["prototype bucket", { ticketBucket: "toString" }],
    ["unknown experience", { experience: "wizard" }],
    ["missing consent", { consentAt: undefined }],
    ["non-string consent", { consentAt: true }],
    ["garbage consent date", { consentAt: "soon" }],
    ["consent far in the future", { consentAt: "2027-01-01T00:00:00.000Z" }],
  ])("rejects %s", (_name, patch) => {
    expect(parseBetaApplication({ ...betaValid, ...patch }, NOW).ok).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(parseBetaApplication(null, NOW).ok).toBe(false);
    expect(parseBetaApplication("beta", NOW).ok).toBe(false);
  });
});
