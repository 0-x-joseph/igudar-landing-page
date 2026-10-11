import { describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/finance";
import { clampTicket, stepTicket, ticketBucket } from "@/lib/simulator";

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

describe("ticketBucket", () => {
  it("returns coarse buckets for analytics, never the exact amount", () => {
    expect(ticketBucket(25_000)).toBe("25-45k");
    expect(ticketBucket(50_000)).toBe("50-95k");
    expect(ticketBucket(100_000)).toBe("100-245k");
    expect(ticketBucket(250_000)).toBe("250-500k");
    expect(ticketBucket(600_000)).toBe("500k+");
  });
});

import { FEE_LINES, simulate } from "@/lib/finance";
import { cumulativeSeries, feeRateText, formatMultiple, scenarioDescription } from "@/lib/simulator";

describe("scenarioDescription", () => {
  it("states yield, vacancy, reserve and price growth from the model", () => {
    const base = scenarioDescription("base");
    expect(base).toContain("8.00");
    expect(base).toContain("no vacancy");
    expect(scenarioDescription("pessimistic")).toContain("5");
    expect(scenarioDescription("pessimistic")).toContain("vacancy or operator default");
    expect(scenarioDescription("optimistic")).toContain("rent indexed");
  });
});

describe("formatMultiple", () => {
  it("shows two decimals and the multiplication sign", () => {
    expect(formatMultiple(1.1698)).toBe("1.17×");
    expect(formatMultiple(Number.NaN)).toBe("—");
  });
});

describe("cumulativeSeries", () => {
  const result = simulate({ ticketMad: 25_000, scenario: "base" });
  const series = cumulativeSeries(result);

  it("starts at minus the ticket in year 0 and has one point per year", () => {
    expect(series).toHaveLength(6);
    expect(series[0].positionMad).toBe(-25_000);
  });

  it("ends on the engine's net profit, with the sale in the last year", () => {
    expect(series[5].positionMad).toBeCloseTo(result.netProfitMad, 6);
    expect(series[5].exitMad).toBeCloseTo(result.netExitProceedsMad, 6);
    expect(series[1].exitMad).toBe(0);
  });
});

describe("feeRateText", () => {
  it("never invents a rate: it reads the grid", () => {
    const text = Object.fromEntries(FEE_LINES.map((l) => [l.code, feeRateText(l)]));
    expect(text.D2).toContain("0.75");
    expect(text.D2).toContain("0.90");
    expect(text.D1).toContain("0");
    expect(text.D5).toContain("15");
    expect(text.D6).toContain("240");
  });
});
