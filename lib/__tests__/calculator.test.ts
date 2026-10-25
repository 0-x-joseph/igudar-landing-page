import { describe, expect, it } from "vitest";
import { formatPercent } from "@/lib/finance";
import {
  calculateOwnership,
  calculatorFeeRows,
  earlyExitFor,
  clampProject,
} from "@/lib/calculator";

describe("calculateOwnership", () => {
  it("gives 0.5 % of the SAS and 200 investors for 25,000 of a 5,000,000 project", () => {
    const r = calculateOwnership({ ticketMad: 25_000, projectMad: 5_000_000 });
    expect(r.share).toBeCloseTo(0.005, 10);
    expect(formatPercent(r.share).replace(/\s/g, " ")).toBe("0.5 %");
    expect(r.investorsNeeded).toBe(200);
  });

  it("rounds the investor count up", () => {
    expect(calculateOwnership({ ticketMad: 25_000, projectMad: 110_000 }).investorsNeeded).toBe(5);
  });

  it("owning the whole project is 100 %", () => {
    expect(calculateOwnership({ ticketMad: 500_000, projectMad: 500_000 }).share).toBe(1);
  });
});

describe("clampProject", () => {
  it("keeps the project between the ticket and the 5,000,000 raise cap", () => {
    expect(clampProject(1_000, 25_000)).toBe(25_000);
    expect(clampProject(9_000_000, 25_000)).toBe(5_000_000);
    expect(clampProject(Number.NaN, 25_000)).toBe(5_000_000);
  });
});

describe("calculatorFeeRows", () => {
  const rows = calculatorFeeRows({ ticketMad: 25_000, projectMad: 5_000_000 });
  const row = (code: string) => rows.find((r) => r.code === code)!;

  it("covers every fee line of the grid", () => {
    expect(rows.map((r) => r.code)).toEqual(["S1", "D1", "D2", "D3", "D4", "D5", "D6"]);
  });

  it("charges the investor nothing for the seller fee, and S2 no longer exists", () => {
    expect(row("S1").yourShareMad).toBe(0);
    expect(row("S1").lineTotalMad).toBeCloseTo(150_000, 6);
    expect(rows.find((r) => (r.code as string) === "S2")).toBeUndefined();
  });

  it("charges D1 1.5 % + VAT (450 MAD) and a 0.75 %/yr platform fee on the ticket", () => {
    expect(row("D1").yourShareMad).toBeCloseTo(450, 6);
    expect(row("D1").paidByYou).toBe(true);
    expect(row("D6").yourShareMad).toBe(0);
    expect(row("D2").yourShareMad).toBeCloseTo(187.5, 6);
  });

  it("leaves the transfer fee for the early-exit calculator", () => {
    expect(row("D4").yourShareMad).toBeNull();
  });

  it("carries no English wording, only a message key for the note", () => {
    expect(row("D4").noteKey).toBe("earlyExitOnly");
    expect(row("D2").noteKey).toBe("perYearHt");
    expect(row("S1").noteKey).toBeUndefined();
    for (const r of rows) expect(Object.keys(r)).not.toContain("label");
  });
});

describe("earlyExitFor", () => {
  it("charges 1 % of the traded value", () => {
    expect(earlyExitFor({ tradedMad: 25_000, year: 2 }).feeMad).toBeCloseTo(250, 6);
  });

  it("flags a window before the first year as closed", () => {
    expect(earlyExitFor({ tradedMad: 25_000, year: 0 }).windowOpen).toBe(false);
    expect(earlyExitFor({ tradedMad: 25_000, year: 1 }).windowOpen).toBe(true);
  });
});
