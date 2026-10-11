import { formatMad, formatPercent, scenarioLabel, type SimulationResult } from "@/lib/finance";
import { investorFeeSummary } from "@/lib/simulator-fees";

/** "What you pay IGUDAR" for the chosen amount. Seller and operator fees are not listed: you do not pay them. */
export function FeesTable({ result }: { result: SimulationResult }) {
  const fees = investorFeeSummary(result);
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;

  const rows = [
    {
      name: "Entry fee",
      amount: formatMad(fees.entryMad),
      detail: "Nothing to pay to subscribe.",
    },
    {
      name: "Platform fee, per year",
      amount: `${formatMad(fees.platformPerYearTtcMad)} incl. TVA`,
      detail: `${formatMad(fees.platformPerYearHtMad)} before TVA. Paid through the property company, it covers its running costs.`,
    },
    {
      name: "Exit fee, your share",
      amount: formatMad(fees.exitFeeShareMad),
      detail: `Charged to the property company when the building is sold (${scenarioLabel(key)} scenario sale price, incl. TVA).`,
    },
    {
      name: "Transfer fee",
      amount: `${formatPercent(fees.transferRate)} of the amount traded`,
      detail: "Only if you sell your share early, in an exit window. Not part of the 5-year simulation.",
    },
  ];

  return (
    <section aria-labelledby="sim-fees-title" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sim-fees-title" className="text-lg font-bold text-foreground">
        What you pay IGUDAR
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        For {formatMad(result.input.ticketMad, { decimals: 0 })}. Sellers and operators pay their own fees; you do not.
      </p>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.name} className="grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6">
            <dt className="min-w-0 text-sm font-semibold text-foreground">{row.name}</dt>
            <dd className="financial-number min-w-0 text-sm font-semibold text-foreground break-words sm:text-right">{row.amount}</dd>
            <dd className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
