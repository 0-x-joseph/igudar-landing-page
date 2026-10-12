"use client";

import { useTranslations } from "next-intl";
import { MODEL_SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";

/** One-line summary of a scenario's assumptions, read from MODEL_SCENARIOS and worded per language. */
function useScenarioDescription(): (key: ScenarioKey) => string {
  const t = useTranslations("simulator.scenario");
  const { percent } = useFormat();
  return (key) => {
    const a = MODEL_SCENARIOS[key];
    const parts = [
      t("grossYield", { rate: percent(a.grossYield, 2) }),
      a.vacancy > 0 ? t("vacancy", { rate: percent(a.vacancy, 0) }) : t("noVacancy"),
      t("rentReserve", { rate: percent(a.rentReserve, 0) }),
      a.priceGrowth > 0 ? t("priceGrowth", { rate: percent(a.priceGrowth) }) : t("priceFlat"),
    ];
    if (a.rentIndexation > 0) parts.push(t("rentIndexed", { rate: percent(a.rentIndexation, 0) }));
    if (a.sellerCostsAtExit > 0) parts.push(t("sellerCosts", { rate: percent(a.sellerCostsAtExit, 0) }));
    return parts.join(" · ");
  };
}

/** Pessimistic / Base / Optimistic segmented control (native radios: arrow keys just work). */
export function ScenarioControl({
  value,
  onChange,
}: {
  value: ScenarioKey;
  onChange: (next: ScenarioKey) => void;
}) {
  const t = useTranslations("simulator.scenario");
  const scenarioLabel = useScenarioLabel();
  const describe = useScenarioDescription();
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-semibold text-foreground">{t("legend")}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {SCENARIO_KEYS.map((key) => (
          <label key={key} className="relative block cursor-pointer">
            <input
              type="radio"
              name="scenario"
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-sm font-semibold text-muted-foreground transition-colors peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              {scenarioLabel(key)}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">{t("current", { label: scenarioLabel(value) })} </span>
        {describe(value)}
      </p>
    </fieldset>
  );
}
