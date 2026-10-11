"use client";

import { useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import {
  LIMITS,
  NET_INDICATIVE_SUFFIX,
  TAX,
  formatMad,
  formatPercent,
  irrLabel,
  scenarioLabel,
  yieldLabel,
  type SimulationResult,
} from "@/lib/finance";
import { formatMultiple } from "@/lib/simulator";
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
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="min-w-0 rounded-3xl border border-border bg-card p-5" onKeyDown={onKeyDown}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold text-muted-foreground">{label}</h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`What does "${label}" mean?`}
          onClick={() => {
            if (!open) track("sim_explainer_open", { topic });
            setOpen((o) => !o);
          }}
          className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
        >
          <HelpCircle className="size-5" aria-hidden="true" />
        </button>
      </div>
      <p className="financial-number mt-1 min-w-0 text-3xl font-bold tracking-tight text-foreground break-words sm:text-4xl">{children}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption}</p>
      <div
        id={panelId}
        hidden={!open}
        className="mt-3 rounded-2xl bg-accent px-4 py-3 text-sm leading-relaxed text-accent-foreground"
      >
        {explainer}
        <Link href="/#how-your-money-moves" className="mt-2 block font-semibold underline underline-offset-2">
          How is this calculated?
        </Link>
      </div>
    </div>
  );
}

/** The four headline figures for the chosen scenario. All values come from the engine. */
export function BigNumbers({ result }: { result: SimulationResult }) {
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const name = scenarioLabel(key);
  const years = result.input.holdYears;
  const mad = (n: number) => formatMad(n);

  return (
    <section aria-labelledby="sim-results-title">
      <h2 id="sim-results-title" className="mb-1 text-lg font-bold text-foreground">
        Your result, {name} scenario
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        All figures are {NET_INDICATIVE_SUFFIX}, after fees and taxes.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          topic="net_cash"
          label="Net cash per year"
          caption={yieldLabel(result.netCashYieldYear1, key)}
          explainer={`The rent your share earns in year 1, after the property reserve, IGUDAR's platform fee (incl. TVA), corporate tax and the ${formatPercent(TAX.WITHHOLDING_INDIVIDUAL, 0)} withholding on dividends. It is a projection, not a promise.`}
        >
          <AnimatedNumber value={result.netCashYear1Mad} format={mad} />
        </StatCard>
        <StatCard
          topic="net_profit"
          label={`Net profit over ${years} years`}
          caption={`Cash received plus your share of the sale, minus what you put in (${NET_INDICATIVE_SUFFIX}).`}
          explainer={`Everything you receive over ${years} years (yearly cash plus your share of the sale at the end) minus the amount you invested, after all fees and taxes. The property could sell for more or less than assumed.`}
        >
          <AnimatedNumber value={result.netProfitMad} format={mad} />
        </StatCard>
        <StatCard
          topic="net_irr"
          label="Net IRR"
          caption={irrLabel(result.netIrr, key)}
          explainer={`IRR is your yearly rate of return counting when each payment arrives. It includes the ${formatPercent(LIMITS.ACQUISITION_COSTS)} purchase costs (registration, land registry, notary) paid from the capital, so it is lower than the cash yield.`}
        >
          {result.netIrr === null ? (
            "n/a"
          ) : (
            <AnimatedNumber value={result.netIrr} format={(n) => formatPercent(n, 2)} />
          )}
        </StatCard>
        <StatCard
          topic="money_multiple"
          label="Money multiple"
          caption={`Total money back divided by money in, over ${years} years (${NET_INDICATIVE_SUFFIX}).`}
          explainer="How many dirhams come back for each dirham invested, after fees and taxes. 1.00× means you only get your money back; below 1.00× would be a loss."
        >
          <AnimatedNumber value={result.moneyMultiple} format={formatMultiple} />
        </StatCard>
      </div>
    </section>
  );
}
