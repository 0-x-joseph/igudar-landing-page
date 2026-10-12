"use client";

import { useTranslations } from "next-intl";
import { type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { investorFeeSummary } from "@/lib/simulator-fees";

/** "What you pay IGUDAR" for the chosen amount. Seller and operator fees are not listed: you do not pay them. */
export function FeesTable({ result }: { result: SimulationResult }) {
  const t = useTranslations("simulator.fees");
  const scenarioLabel = useScenarioLabel();
  const { mad, percent } = useFormat();
  const fees = investorFeeSummary(result);
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;

  const rows = [
    {
      id: "entry",
      name: t("entry.name"),
      amount: mad(fees.entryMad),
      detail: t("entry.detail"),
    },
    {
      id: "platform",
      name: t("platform.name"),
      amount: t("platform.amount", { amount: mad(fees.platformPerYearTtcMad) }),
      detail: t("platform.detail", { amount: mad(fees.platformPerYearHtMad) }),
    },
    {
      id: "exit",
      name: t("exit.name"),
      amount: mad(fees.exitFeeShareMad),
      detail: t("exit.detail", { scenario: scenarioLabel(key) }),
    },
    {
      id: "transfer",
      name: t("transfer.name"),
      amount: t("transfer.amount", { rate: percent(fees.transferRate) }),
      detail: t("transfer.detail", { years: result.input.holdYears }),
    },
  ];

  return (
    <section aria-labelledby="sim-fees-title" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sim-fees-title" className="text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {t("intro", { amount: mad(result.input.ticketMad, { decimals: 0 }) })}
      </p>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.id} className="grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6">
            <dt className="min-w-0 text-sm font-semibold text-foreground">{row.name}</dt>
            <dd className="financial-number min-w-0 text-sm font-semibold text-foreground break-words sm:text-end">{row.amount}</dd>
            <dd className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
