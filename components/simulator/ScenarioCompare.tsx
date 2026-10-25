"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, MinusCircle } from "lucide-react";
import { SCENARIO_KEYS, type ScenarioKey, type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";

/**
 * All three scenarios side by side, pessimistic first: the bad case is never hidden
 * and always sits next to the one you chose (finance spec section 6).
 */
export function ScenarioCompare({
  all,
  selected,
}: {
  all: Record<ScenarioKey, SimulationResult>;
  selected: ScenarioKey;
}) {
  const t = useTranslations("simulator.compare");
  const ts = useTranslations("simulator");
  const scenarioLabel = useScenarioLabel();
  const { mad, percent } = useFormat();
  return (
    <section aria-labelledby="sim-compare-title">
      <h2 id="sim-compare-title" className="mb-1 text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">{t("intro")}</p>
      <p data-testid="compare-outlay" className="financial-number mb-4 text-sm font-semibold text-foreground">
        {t("outlay", {
          ticket: mad(all.base.input.ticketMad, { decimals: 0 }),
          fee: mad(all.base.entryFeeMad, { decimals: 0 }),
          total: mad(all.base.outlayMad, { decimals: 0 }),
        })}
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {SCENARIO_KEYS.map((key) => {
          const r = all[key];
          const isSelected = key === selected;
          return (
            <li
              key={key}
              aria-current={isSelected ? "true" : undefined}
              className={`min-w-0 rounded-2xl border bg-card p-4 ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <p className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                <span className="min-w-0">{scenarioLabel(key)}</span>
                {isSelected && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    {t("chosen")}
                  </span>
                )}
              </p>
              <dl className="financial-number mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("netCash")}</dt>
                  <dd className="font-semibold text-foreground break-words">{mad(r.netCashYear1Mad)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("netProfit", { years: r.input.holdYears })}</dt>
                  <dd className="font-semibold text-foreground break-words">{mad(r.netProfitMad)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("netIrr")}</dt>
                  <dd className="font-semibold text-foreground break-words">
                    {r.netIrr === null ? ts("na") : percent(r.netIrr, 2)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-muted-foreground">
                {r.beatsBankDeposit ? (
                  <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <MinusCircle className="mt-px size-4 shrink-0 text-destructive" aria-hidden="true" />
                )}
                {r.beatsBankDeposit ? t("beats") : t("loses")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
