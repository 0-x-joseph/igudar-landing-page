"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { LIMITS, formatMad, simulateAll, type ScenarioKey } from "@/lib/finance";
import { DEFAULT_TICKET_MAD, clampTicket, ticketBucket } from "@/lib/simulator";
import { track } from "@/lib/analytics";
import { TicketField } from "./TicketField";
import { ScenarioControl } from "./ScenarioControl";
import { BigNumbers } from "./BigNumbers";
import { ScenarioCompare } from "./ScenarioCompare";
import { BankComparison } from "./BankComparison";
import { CumulativeCashChart } from "./CumulativeCashChart";
import { RentBridge } from "./RentBridge";
import { FeesTable } from "./FeesTable";
import { InterestCapture } from "./InterestCapture";
import { StickySummary } from "./StickySummary";

/** The full simulator: controls on the left (stacked above on mobile), results on the right. */
export function Simulator() {
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-32">
        <TicketField id="sim-amount" label="Amount to simulate" value={ticket} onChange={(n) => setTicket(clampTicket(n))} />

        <div>
          <label htmlFor="sim-amount-slider" className="sr-only">
            Amount slider, from {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} to{" "}
            {formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 })}
          </label>
          <input
            id="sim-amount-slider"
            type="range"
            min={LIMITS.MIN_TICKET_MAD}
            max={LIMITS.MAX_PER_PROJECT_MAD}
            step={LIMITS.TICKET_STEP_MAD}
            value={Math.min(ticket, LIMITS.MAX_PER_PROJECT_MAD)}
            onChange={(e) => setTicket(clampTicket(Number(e.target.value)))}
            aria-valuetext={formatMad(ticket, { decimals: 0 })}
            className="h-11 w-full cursor-pointer accent-primary"
          />
          <div className="financial-number flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>{formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}</span>
            <span>{formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 })}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {aboveCap ? (
              <>
                Business angels are not capped.{" "}
                <Link href="/#waitlist-cta" className="font-semibold text-primary underline underline-offset-2">
                  Talk to us
                </Link>
                .
              </>
            ) : (
              <>
                Steps of {formatMad(LIMITS.TICKET_STEP_MAD, { decimals: 0 })}. The limit is{" "}
                {formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 })} per project. Above that: business angels are
                not capped, talk to us.
              </>
            )}
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
            Holding period: {LIMITS.HOLD_YEARS} years, fixed
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Your money is locked up while the property is held. After the first year, organised exit windows open every{" "}
            {LIMITS.EXIT_WINDOW_MONTHS} months, where you can offer your share to other associates. A buyer is not
            guaranteed and a transfer fee applies. This simulation assumes you stay until the sale in year{" "}
            {LIMITS.HOLD_YEARS}.
          </p>
        </div>
      </div>

      <div className="min-w-0 space-y-8">
        <BigNumbers result={result} />
        <ScenarioCompare all={all} selected={scenario} />
        <BankComparison result={result} />
        <CumulativeCashChart result={result} />
        <RentBridge result={result} />
        <FeesTable result={result} />
        <InterestCapture amountMad={ticket} scenario={scenario} />
      </div>

      <StickySummary result={result} />
    </div>
  );
}
