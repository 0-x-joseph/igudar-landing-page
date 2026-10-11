"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { LIMITS, formatMad, formatPercent } from "@/lib/finance";
import { calculateOwnership, clampProject } from "@/lib/calculator";
import { DEFAULT_TICKET_MAD, clampTicket } from "@/lib/simulator";
import { track } from "@/lib/analytics";
import { TicketField } from "@/components/simulator/TicketField";
import { AnimatedNumber } from "@/components/simulator/AnimatedNumber";

const DEFAULT_PROJECT_MAD = LIMITS.MAX_RAISE_MAD;

const inputClass =
  "financial-number h-12 w-full rounded-2xl border border-border bg-card px-4 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Card({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id={id} className="text-lg font-bold text-foreground">
        {title}
      </h2>
      {intro && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function numberFrom(value: string): number {
  const n = Number(value);
  return value.trim() === "" || !Number.isFinite(n) || n < 0 ? 0 : n;
}

/** Fees and ownership calculator. Every figure comes from lib/finance through lib/calculator. */
export function Calculator() {
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const [projectInput, setProjectInput] = useState(String(DEFAULT_PROJECT_MAD));

  useEffect(() => {
    track("calc_view");
  }, []);

  const project = clampProject(numberFrom(projectInput), ticket);
  const ownership = useMemo(() => calculateOwnership({ ticketMad: ticket, projectMad: project }), [ticket, project]);

  return (
    <div className="space-y-8">
      <Card title="Your amount and the project" intro="Ownership is your amount divided by what the project raises.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TicketField id="calc-amount" label="Your amount" value={ticket} onChange={(n) => setTicket(clampTicket(n))} />
          <div>
            <label htmlFor="calc-project" className="mb-2 block text-sm font-semibold text-foreground">
              Project size (capital raised, MAD)
            </label>
            <input
              id="calc-project"
              type="number"
              inputMode="numeric"
              min={ticket}
              max={LIMITS.MAX_RAISE_MAD}
              step={100_000}
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              onBlur={() => setProjectInput(String(project))}
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Up to {formatMad(LIMITS.MAX_RAISE_MAD, { decimals: 0 })} per project over 12 months.
            </p>
          </div>
        </div>
      </Card>

      <section aria-labelledby="calc-own-title">
        <h2 id="calc-own-title" className="sr-only">
          Ownership
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground">Your ownership of the property company (SAS)</h3>
            <p className="financial-number mt-1 text-3xl font-bold text-foreground sm:text-4xl">
              <AnimatedNumber value={ownership.share} format={(n) => formatPercent(n, 3)} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              You become a shareholder of the company that owns the property, in proportion to your amount.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground">Investors needed to fill the project</h3>
            <p className="financial-number mt-1 text-3xl font-bold text-foreground sm:text-4xl">
              <AnimatedNumber value={ownership.investorsNeeded} format={(n) => Math.round(n).toLocaleString("en-US")} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              At the {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} minimum ticket.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
