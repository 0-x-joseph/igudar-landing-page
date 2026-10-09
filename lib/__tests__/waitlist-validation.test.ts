import { describe, expect, it } from "vitest";
import { parseInterestPayload } from "@/lib/waitlist-validation";

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
