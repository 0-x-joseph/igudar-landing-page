"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { LIMITS, type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";

/** Net profit vs the same money in a 12-month bank deposit, with the honest sentence if it loses. */
export function BankComparison({ result }: { result: SimulationResult }) {
  const t = useTranslations("simulator.bank");
  const scenarioLabel = useScenarioLabel();
  const { mad, percent } = useFormat();
  const reduce = useReducedMotion();
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const years = result.input.holdYears;
  const rows = [
    {
      id: "igudar",
      label: t("igudarRow", { scenario: scenarioLabel(key) }),
      value: result.netProfitMad,
      bar: "bg-foreground",
    },
    {
      id: "deposit",
      label: t("depositRow", { rate: percent(LIMITS.BANK_DEPOSIT_RATE) }),
      value: result.bankDepositProfitMad,
      bar: "bg-muted-foreground/40",
    },
  ];
  const max = Math.max(...rows.map((r) => Math.max(r.value, 0)), 1);

  return (
    <section aria-labelledby="sim-bank-title" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sim-bank-title" className="text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">{t("intro", { years, scenario: scenarioLabel(key) })}</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 font-medium text-foreground">{row.label}</span>
              <span className="financial-number shrink-0 whitespace-nowrap text-end font-semibold text-foreground">{mad(row.value)}</span>
            </div>
            {/* The bar is a normal block, so it grows from the start side in both directions. */}
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
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("wins", { years })}</p>
      ) : (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-foreground"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          {t("loses")}
        </p>
      )}
    </section>
  );
}
