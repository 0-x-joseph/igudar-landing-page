import {
  FEE_LINES,
  LIMITS,
  TAX,
  earlyExitFeeMad,
  feeLinesForTicket,
  formatMad,
  type FeeLine,
} from "@/lib/finance";
import { feeRateText } from "@/lib/simulator";

/** Ticket the "this means" column is worked out for: the minimum, so every figure is the smallest case. */
export const EXAMPLE_TICKET_MAD = LIMITS.MIN_TICKET_MAD;

/** What a fee means in money for the example ticket. Computed from the engine, never typed by hand. */
export function ticketMeaning(line: FeeLine, ticketMad: number = EXAMPLE_TICKET_MAD): string {
  const withAmount = feeLinesForTicket(ticketMad).find((l) => l.code === line.code);
  const amount = withAmount?.amountMad ?? null;
  switch (line.code) {
    case "S1":
    case "S2":
      return "Not charged to you";
    case "D1":
      return formatMad(amount ?? 0, { decimals: 0 });
    case "D2": {
      const ht = amount ?? 0;
      return `${formatMad(ht)} per year HT (${formatMad(ht * (1 + TAX.TVA_ON_FEES))} TTC)`;
    }
    case "D3":
      return "Paid by the property company when the building is sold. Depends on the sale price";
    case "D4":
      return `${formatMad(earlyExitFeeMad(ticketMad))}, only if you sell early`;
    case "D5":
      return "Only if the gain beats the hurdle. Depends on the sale price";
    default:
      return "Optional, never priority access to assets";
  }
}

const codeChip = "mr-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground";

/**
 * Public fee grid: who pays what, when, and what each line means at 25,000 MAD.
 * Small screens get one card per fee so nothing scrolls sideways. Promotions are not shown (off by default).
 */
export default function PricingTable() {
  const ticket = formatMad(EXAMPLE_TICKET_MAD, { decimals: 0 });
  return (
    <div>
      <ul className="divide-y divide-border rounded-3xl border border-border bg-card sm:hidden" aria-label="Fee grid">
        {FEE_LINES.map((line) => (
          <li key={line.code} data-testid="fee-row" className="space-y-2 p-5">
            <p className="text-base font-semibold text-foreground">
              <span className={codeChip}>{line.code}</span>
              {line.label}
            </p>
            <p className="financial-number text-sm font-semibold text-foreground">{feeRateText(line)}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Paid by {line.paidBy.toLowerCase()}. {line.when}.
            </p>
            <p className="financial-number rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
              At {ticket}: {ticketMeaning(line)}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-3xl border border-border bg-card sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Who pays what, when, and what it means at {ticket}</caption>
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Fee</th>
              <th scope="col" className="px-5 py-4 font-semibold">Paid by</th>
              <th scope="col" className="px-5 py-4 font-semibold">Rate</th>
              <th scope="col" className="px-5 py-4 font-semibold">When</th>
              <th scope="col" className="px-5 py-4 font-semibold">At {ticket} this means…</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FEE_LINES.map((line) => (
              <tr key={line.code} data-testid="fee-row" className="align-top">
                <th scope="row" className="px-5 py-5 font-semibold text-foreground">
                  <span className={codeChip}>{line.code}</span>
                  {line.label}
                </th>
                <td className="px-5 py-5 text-muted-foreground">{line.paidBy}</td>
                <td className="financial-number px-5 py-5 font-semibold text-foreground">{feeRateText(line)}</td>
                <td className="px-5 py-5 text-muted-foreground">{line.when}</td>
                <td className="financial-number px-5 py-5 font-semibold text-foreground">{ticketMeaning(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
