import { CheckCircle2, MinusCircle } from "lucide-react";
import {
  SCENARIO_KEYS,
  formatMad,
  formatPercent,
  scenarioLabel,
  type ScenarioKey,
  type SimulationResult,
} from "@/lib/finance";

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
  return (
    <section aria-labelledby="sim-compare-title">
      <h2 id="sim-compare-title" className="mb-1 text-lg font-bold text-foreground">
        The same amount in each scenario
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        We always show the pessimistic case first. Real life can land anywhere in this range, or outside it.
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
                    Chosen
                  </span>
                )}
              </p>
              <dl className="financial-number mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Net cash per year</dt>
                  <dd className="font-semibold text-foreground break-words">{formatMad(r.netCashYear1Mad)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Net profit over {r.input.holdYears} years</dt>
                  <dd className="font-semibold text-foreground break-words">{formatMad(r.netProfitMad)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Net IRR</dt>
                  <dd className="font-semibold text-foreground break-words">
                    {r.netIrr === null ? "n/a" : formatPercent(r.netIrr, 2)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-muted-foreground">
                {r.beatsBankDeposit ? (
                  <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <MinusCircle className="mt-px size-4 shrink-0 text-destructive" aria-hidden="true" />
                )}
                {r.beatsBankDeposit ? "Beats a bank deposit" : "Loses to a bank deposit"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
