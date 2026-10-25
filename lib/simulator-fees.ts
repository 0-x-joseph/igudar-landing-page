/**
 * "What you pay IGUDAR" figures for the chosen amount, derived from the engine's
 * fee table and its simulation result. No new rates live here.
 */
import { FEE_GRID, TAX, feeLinesForTicket, type SimulationResult } from "@/lib/finance";

export interface InvestorFeeSummary {
  /** D1 structuring fee incl. VAT, paid on top of the ticket at subscription. */
  entryMad: number;
  /** Cash out at subscription: ticket + D1 incl. VAT. */
  outlayMad: number;
  entryRate: number;
  platformPerYearHtMad: number;
  platformPerYearTtcMad: number;
  /** Investor's share of the exit fee borne by the SAS (incl. TVA). */
  exitFeeShareMad: number;
  transferRate: number;
}

export function investorFeeSummary(result: SimulationResult): InvestorFeeSummary {
  const ticket = result.input.ticketMad;
  const lines = feeLinesForTicket(ticket, result.input.holdYears);
  const amount = (code: string) => lines.find((l) => l.code === code)?.amountMad ?? 0;
  const platformHt = amount("D2");
  return {
    entryMad: amount("D1"),
    outlayMad: result.outlayMad,
    entryRate: FEE_GRID.D1_ENTRY,
    platformPerYearHtMad: platformHt,
    platformPerYearTtcMad: platformHt * (1 + TAX.TVA_ON_FEES),
    exitFeeShareMad: result.share * result.exit.saleMad * FEE_GRID.D3_EXIT_HT * (1 + TAX.TVA_ON_FEES),
    transferRate: FEE_GRID.D4_TRANSFER_HT,
  };
}
