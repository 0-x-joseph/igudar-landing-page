"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { LIMITS, formatMad, formatPercent, scenarioLabel, type SimulationResult } from "@/lib/finance";

/** Net profit vs the same money in a 12-month bank deposit, with the honest sentence if it loses. */
export function BankComparison({ result }: { result: SimulationResult }) {
  const reduce = useReducedMotion();
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const years = result.input.holdYears;
  const rows = [
    {
      label: `IGUDAR share, ${scenarioLabel(key)}`,
      value: result.netProfitMad,
      bar: "bg-foreground",
    },
    {
      label: `Bank deposit at ${formatPercent(LIMITS.BANK_DEPOSIT_RATE)}/yr`,
      value: result.bankDepositProfitMad,
      bar: "bg-muted-foreground/40",
    },
  ];
  const max = Math.max(...rows.map((r) => Math.max(r.value, 0)), 1);

  return (
    <section aria-labelledby="sim-bank-title" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sim-bank-title" className="text-lg font-bold text-foreground">
        Versus a bank deposit
      </h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        Net profit over {years} years on the same amount ({scenarioLabel(key)} scenario, indicative).
      </p>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="financial-number font-semibold text-foreground">{formatMad(row.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <motion.div
                className={`h-full rounded-full ${row.bar}`}
                initial={false}
                animate={{ width: `${(Math.max(row.value, 0) / max) * 100}%` }}
                transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      {result.beatsBankDeposit ? (
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          In this scenario the property share earns more than a deposit. It also carries risks a deposit does not:
          vacancy, a falling price, and money locked up for {years} years.
        </p>
      ) : (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-2xl bg-destructive-soft px-4 py-3 text-sm font-semibold text-foreground"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          In this scenario a bank deposit would have earned more.
        </p>
      )}
    </section>
  );
}
