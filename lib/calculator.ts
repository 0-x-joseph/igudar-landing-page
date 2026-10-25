/**
 * Ownership, fee shares and early-exit helpers for /calculator.
 * Built on lib/finance: the engine owns the numbers, this only arranges them.
 */
import {
  FEE_GRID,
  FEE_LINES,
  LIMITS,
  TAX,
  earlyExitFeeMad,
  simulate,
  type FeeCode,
} from "@/lib/finance";

export interface OwnershipResult {
  /** Fraction of the property company (SAS) the ticket buys. */
  share: number;
  /** Investors needed to fill the project at the minimum ticket. */
  investorsNeeded: number;
}

/** Keeps the project between the ticket and the 5,000,000 raise cap. */
export function clampProject(projectMad: number, ticketMad: number): number {
  if (!Number.isFinite(projectMad)) return LIMITS.MAX_RAISE_MAD;
  return Math.min(LIMITS.MAX_RAISE_MAD, Math.max(ticketMad, Math.round(projectMad)));
}

export function calculateOwnership(input: { ticketMad: number; projectMad: number }): OwnershipResult {
  const { share } = simulate({ ticketMad: input.ticketMad, scenario: "base", raiseMad: input.projectMad });
  return {
    share,
    investorsNeeded: Math.ceil(input.projectMad / LIMITS.MIN_TICKET_MAD),
  };
}

/** Key under `calculator.feeNotes` in the messages: the words that qualify a row live there, not here. */
export type CalculatorFeeNote = "perYearHt" | "baseSaleTtc" | "earlyExitOnly" | "aboveHurdle" | "atSubscription" | "optional";

/** One fee line for the calculator. Its name, payer and timing come from `FEE_LINES` by code. */
export interface CalculatorFeeRow {
  code: FeeCode;
  /** What the fee is on the whole project (null when it depends on the sale). */
  lineTotalMad: number | null;
  /** What this investor pays: 0 when someone else pays, null when it depends on events. */
  yourShareMad: number | null;
  /** True when the fee reduces the investor's return. */
  paidByYou: boolean;
  noteKey?: CalculatorFeeNote;
}

/**
 * Fee lines for a ticket and a project size (spec section 2). Seller and operator
 * fees (S1, S2) are shown with what they pay and a 0 share for the investor.
 * Exit-related lines use the Base scenario sale.
 */
export function calculatorFeeRows(input: { ticketMad: number; projectMad: number }): CalculatorFeeRow[] {
  const { ticketMad, projectMad } = input;
  const sim = simulate({ ticketMad, scenario: "base", raiseMad: projectMad });
  const tva = 1 + TAX.TVA_ON_FEES;

  return FEE_LINES.map((line): CalculatorFeeRow => {
    const base = { code: line.code };
    switch (line.code) {
      case "S1":
        return { ...base, lineTotalMad: projectMad * FEE_GRID.S1_SYNDICATION, yourShareMad: 0, paidByYou: false };
      case "D1":
        return { ...base, lineTotalMad: projectMad * FEE_GRID.D1_ENTRY * tva, yourShareMad: ticketMad * FEE_GRID.D1_ENTRY * tva, paidByYou: true, noteKey: "atSubscription" };
      case "D2":
        return {
          ...base,
          lineTotalMad: projectMad * FEE_GRID.D2_PLATFORM_HT,
          yourShareMad: ticketMad * FEE_GRID.D2_PLATFORM_HT,
          paidByYou: true,
          noteKey: "perYearHt",
        };
      case "D3":
        return {
          ...base,
          lineTotalMad: sim.exit.saleMad * FEE_GRID.D3_EXIT_HT * tva,
          yourShareMad: sim.share * sim.exit.saleMad * FEE_GRID.D3_EXIT_HT * tva,
          paidByYou: true,
          noteKey: "baseSaleTtc",
        };
      case "D4":
        return { ...base, lineTotalMad: null, yourShareMad: null, paidByYou: false, noteKey: "earlyExitOnly" };
      case "D5":
        return {
          ...base,
          lineTotalMad: sim.exit.performanceFeeMad,
          yourShareMad: sim.share * sim.exit.performanceFeeMad,
          paidByYou: true,
          noteKey: "aboveHurdle",
        };
      default:
        // D6 dossier fee: 0 for everyone.
        return { ...base, lineTotalMad: 0, yourShareMad: 0, paidByYou: false };
    }
  });
}

export interface EarlyExitResult {
  /** D4 transfer fee paid by the selling associate. */
  feeMad: number;
  /** Exit windows open every 6 months once the first year of holding is over. */
  windowOpen: boolean;
}

export function earlyExitFor(input: { tradedMad: number; year: number }): EarlyExitResult {
  return {
    feeMad: earlyExitFeeMad(input.tradedMad),
    windowOpen: input.year >= LIMITS.EXIT_LOCK_YEARS,
  };
}
