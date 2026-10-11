"use client";

import { SCENARIO_KEYS, scenarioLabel, type ScenarioKey } from "@/lib/finance";
import { scenarioDescription } from "@/lib/simulator";

/** Pessimistic / Base / Optimistic segmented control (native radios: arrow keys just work). */
export function ScenarioControl({
  value,
  onChange,
}: {
  value: ScenarioKey;
  onChange: (next: ScenarioKey) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-semibold text-foreground">Scenario</legend>
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
        <span className="font-semibold text-foreground">{scenarioLabel(value)}: </span>
        {scenarioDescription(value)}
      </p>
    </fieldset>
  );
}
