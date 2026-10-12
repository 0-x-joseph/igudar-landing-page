"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { LIMITS, TAX, type SimulationResult } from "@/lib/finance";
import { Link } from "@/i18n/navigation";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { track } from "@/lib/analytics";
import { AnimatedNumber } from "./AnimatedNumber";

function StatCard({
  topic,
  label,
  explainer,
  caption,
  children,
}: {
  topic: string;
  label: string;
  explainer: string;
  caption: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("simulator.results");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="min-w-0 rounded-3xl border border-border bg-card p-5" onKeyDown={onKeyDown}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold text-muted-foreground">{label}</h3>
        <span className="group relative shrink-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={t("explainerLabel", { label })}
            onClick={() => {
              if (!open) track("sim_explainer_open", { topic });
              setOpen((o) => !o);
            }}
            className="-m-2 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
          >
            <HelpCircle className="size-5" aria-hidden="true" />
          </button>
          <span
            id={panelId}
            role="tooltip"
            className={`absolute end-0 top-full z-20 mt-1 w-64 rounded-2xl border border-border bg-popover px-4 py-3 text-start text-sm leading-relaxed text-popover-foreground shadow-lg transition-opacity duration-150 sm:w-72 ${
              open
                ? "visible opacity-100"
                : "invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
            }`}
          >
            {explainer}
            <Link href="/#how-your-money-moves" className="mt-2 block font-semibold text-primary underline underline-offset-2">
              {t("howCalculated")}
            </Link>
          </span>
        </span>
      </div>
      <p className="financial-number mt-1 min-w-0 text-3xl font-bold tracking-tight text-foreground break-words sm:text-4xl">{children}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
}

/** The four headline figures for the chosen scenario. All values come from the engine. */
export function BigNumbers({ result }: { result: SimulationResult }) {
  const t = useTranslations("simulator.results");
  const ts = useTranslations("simulator");
  const tc = useTranslations("common");
  const scenarioLabel = useScenarioLabel();
  const { mad: formatMad, percent, number } = useFormat();
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const name = scenarioLabel(key);
  const years = result.input.holdYears;
  const suffix = tc("notice.netIndicative");
  const mad = (n: number) => formatMad(n);
  /** "1.17×" · "1,17×". A non-finite multiple is shown as an em dash. */
  const multiple = (n: number) => (Number.isFinite(n) ? `${number(n, 2)}×` : "—");

  return (
    <section aria-labelledby="sim-results-title">
      <h2 id="sim-results-title" className="mb-1 text-lg font-bold text-foreground">
        {t("title", { scenario: name })}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{t("intro", { suffix })}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          topic="net_cash"
          label={t("netCash.label")}
          caption={t("netCash.caption", { rate: percent(result.netCashYieldYear1), scenario: name })}
          explainer={t("netCash.explainer", { withholding: percent(TAX.WITHHOLDING_INDIVIDUAL, 0) })}
        >
          <AnimatedNumber value={result.netCashYear1Mad} format={mad} />
        </StatCard>
        <StatCard
          topic="net_profit"
          label={t("netProfit.label", { years })}
          caption={t("netProfit.caption", { suffix })}
          explainer={t("netProfit.explainer", { years })}
        >
          <AnimatedNumber value={result.netProfitMad} format={mad} />
        </StatCard>
        <StatCard
          topic="net_irr"
          label={t("netIrr.label")}
          caption={
            result.netIrr === null
              ? t("netIrr.captionUnavailable", { scenario: name })
              : t("netIrr.caption", { rate: percent(result.netIrr), scenario: name })
          }
          explainer={t("netIrr.explainer", { acquisition: percent(LIMITS.ACQUISITION_COSTS) })}
        >
          {result.netIrr === null ? ts("na") : <AnimatedNumber value={result.netIrr} format={(n) => percent(n, 2)} />}
        </StatCard>
        <StatCard
          topic="money_multiple"
          label={t("moneyMultiple.label")}
          caption={t("moneyMultiple.caption", { years, suffix })}
          explainer={t("moneyMultiple.explainer")}
        >
          <AnimatedNumber value={result.moneyMultiple} format={multiple} />
        </StatCard>
      </div>
    </section>
  );
}
