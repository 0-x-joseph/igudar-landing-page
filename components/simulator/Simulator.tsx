"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { LIMITS, simulateAll, type ScenarioKey } from "@/lib/finance";
import { Link } from "@/i18n/navigation";
import { useFormat } from "@/lib/i18n/use-format";
import { DEFAULT_TICKET_MAD, clampTicket, ticketBucket } from "@/lib/simulator";
import { track } from "@/lib/analytics";
import { TicketField } from "./TicketField";
import { ScenarioControl } from "./ScenarioControl";
import { BigNumbers } from "./BigNumbers";
import { ScenarioCompare } from "./ScenarioCompare";
import { BankComparison } from "./BankComparison";
import { RentBridge } from "./RentBridge";
import { FeesTable } from "./FeesTable";
import { InterestCapture } from "./InterestCapture";
import { StickySummary } from "./StickySummary";

/** The full simulator: controls on the start side (stacked above on mobile), results beside them. */
export function Simulator() {
  const t = useTranslations("simulator.controls");
  const { mad } = useFormat();
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const all = useMemo(() => simulateAll(ticket), [ticket]);
  const result = all[scenario];
  const firstRender = useRef(true);

  useEffect(() => {
    track("sim_view");
  }, []);

  // Amount changes are debounced so dragging the slider sends one event, with a bucket only.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => track("sim_amount_change", { bucket: ticketBucket(ticket) }), 600);
    return () => window.clearTimeout(timer);
  }, [ticket]);

  const aboveCap = ticket > LIMITS.MAX_PER_PROJECT_MAD;
  const min = mad(LIMITS.MIN_TICKET_MAD, { decimals: 0 });
  const max = mad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 });
  const step = mad(LIMITS.TICKET_STEP_MAD, { decimals: 0 });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-32">
        <TicketField id="sim-amount" label={t("amountLabel")} value={ticket} onChange={(n) => setTicket(clampTicket(n))} />

        <div>
          <label htmlFor="sim-amount-slider" className="sr-only">
            {t("sliderLabel", { min, max })}
          </label>
          {/* The range input inherits the page direction, so in Arabic the minimum sits on the right, like the labels below it. */}
          <input
            id="sim-amount-slider"
            type="range"
            min={LIMITS.MIN_TICKET_MAD}
            max={LIMITS.MAX_PER_PROJECT_MAD}
            step={LIMITS.TICKET_STEP_MAD}
            value={Math.min(ticket, LIMITS.MAX_PER_PROJECT_MAD)}
            onChange={(e) => setTicket(clampTicket(Number(e.target.value)))}
            aria-valuetext={mad(ticket, { decimals: 0 })}
            className="h-11 w-full cursor-pointer accent-primary"
          />
          <div className="financial-number flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>{min}</span>
            <span>{max}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {aboveCap
              ? t.rich("angelsUncapped", {
                  link: (chunks) => (
                    <Link href="/#waitlist-cta" className="font-semibold text-primary underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })
              : t("stepsNote", { step, max })}
          </p>
        </div>

        <ScenarioControl
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            track("sim_scenario_change", { scenario: next });
          }}
        />

        <div className="rounded-2xl bg-muted p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lock className="size-4" aria-hidden="true" />
            {t("holding", { years: LIMITS.HOLD_YEARS })}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("holdingNote", { months: LIMITS.EXIT_WINDOW_MONTHS, years: LIMITS.HOLD_YEARS })}
          </p>
        </div>
      </div>

      <div className="min-w-0 space-y-8">
        <BigNumbers result={result} />
        <ScenarioCompare all={all} selected={scenario} />
        <BankComparison result={result} />
        <RentBridge result={result} />
        <FeesTable result={result} />
        <InterestCapture amountMad={ticket} scenario={scenario} />
      </div>

      <StickySummary result={result} />
    </div>
  );
}
