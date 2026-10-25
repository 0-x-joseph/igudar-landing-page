import { describe, expect, it } from "vitest";
import { FEE_LINES, LIMITS } from "@/lib/finance";
import { clampTicket, feeRateText, parseAmount, stepTicket, ticketBucket } from "@/lib/simulator";

describe("clampTicket", () => {
  it("never goes below the 25,000 MAD minimum", () => {
    expect(clampTicket(10_000)).toBe(LIMITS.MIN_TICKET_MAD);
    expect(clampTicket(0)).toBe(LIMITS.MIN_TICKET_MAD);
    expect(clampTicket(-5)).toBe(LIMITS.MIN_TICKET_MAD);
  });

  it("falls back to the minimum for non-finite input", () => {
    expect(clampTicket(Number.NaN)).toBe(LIMITS.MIN_TICKET_MAD);
    expect(clampTicket(Infinity)).toBe(LIMITS.MIN_TICKET_MAD);
  });

  it("rounds to the 5,000 step", () => {
    expect(clampTicket(27_400)).toBe(25_000);
    expect(clampTicket(27_600)).toBe(30_000);
    expect(clampTicket(30_000)).toBe(30_000);
  });

  it("allows angels above 500,000 up to the raise size, not beyond", () => {
    expect(clampTicket(750_000)).toBe(750_000);
    expect(clampTicket(9_000_000)).toBe(LIMITS.MAX_RAISE_MAD);
  });

  it("can be capped at the per-project limit", () => {
    expect(clampTicket(750_000, { max: LIMITS.MAX_PER_PROJECT_MAD })).toBe(500_000);
  });
});

describe("stepTicket", () => {
  it("steps by 5,000", () => {
    expect(stepTicket(25_000, 1)).toBe(30_000);
    expect(stepTicket(30_000, -1)).toBe(25_000);
  });

  it("cannot step below the minimum", () => {
    expect(stepTicket(25_000, -1)).toBe(25_000);
  });
});

describe("parseAmount", () => {
  it("reads plain digits", () => {
    expect(parseAmount("25000")).toBe(25_000);
    expect(parseAmount(" 25000 ")).toBe(25_000);
  });

  it("accepts the English, French and Arabic groupings", () => {
    expect(parseAmount("25,000")).toBe(25_000);
    expect(parseAmount("25 000")).toBe(25_000);
    expect(parseAmount("25 000")).toBe(25_000);
    expect(parseAmount("25 000")).toBe(25_000);
    expect(parseAmount("25.000")).toBe(25_000);
    expect(parseAmount("1.250.000")).toBe(1_250_000);
    expect(parseAmount("1,250,000")).toBe(1_250_000);
    expect(parseAmount("5.000.000")).toBe(5_000_000);
  });

  it("maps Arabic-Indic and extended Arabic-Indic digits to 0-9", () => {
    expect(parseAmount("٢٥٠٠٠")).toBe(25_000);
    expect(parseAmount("٢٥٬٠٠٠")).toBe(25_000);
    expect(parseAmount("۳۰۰۰۰")).toBe(30_000);
  });

  it("keeps a decimal mark that is not a thousands separator", () => {
    expect(parseAmount("25000,50")).toBe(25_000.5);
    expect(parseAmount("25000.50")).toBe(25_000.5);
    expect(parseAmount("25.000,50")).toBe(25_000.5);
    expect(parseAmount("25,000.50")).toBe(25_000.5);
    expect(parseAmount("٢٥٠٠٠٫٥")).toBe(25_000.5);
  });

  it("ignores a currency word and returns NaN for nothing numeric", () => {
    expect(parseAmount("25 000 MAD")).toBe(25_000);
    expect(parseAmount("25 000 درهم")).toBe(25_000);
    expect(Number.isNaN(parseAmount(""))).toBe(true);
    expect(Number.isNaN(parseAmount("abc"))).toBe(true);
    expect(Number.isNaN(parseAmount("-"))).toBe(true);
  });
});

describe("ticketBucket", () => {
  it("returns coarse buckets for analytics, never the exact amount", () => {
    expect(ticketBucket(25_000)).toBe("25-45k");
    expect(ticketBucket(50_000)).toBe("50-95k");
    expect(ticketBucket(100_000)).toBe("100-245k");
    expect(ticketBucket(250_000)).toBe("250-500k");
    expect(ticketBucket(600_000)).toBe("500k+");
  });
});

describe("feeRateText", () => {
  it("never invents a rate: it reads the grid", () => {
    const text = Object.fromEntries(FEE_LINES.map((l) => [l.code, feeRateText(l)]));
    expect(text.D2).toContain("0.75");
    expect(text.D2).toContain("0.90");
    expect(text.D1.replace(/\s/g, " ")).toContain("1.5 %");
    expect(text.D1).toContain("TVA");
    expect(text.D5).toContain("15");
    expect(text.S2).toBeUndefined();
    expect(text.D6).toBe("No dossier fee");
  });
});
