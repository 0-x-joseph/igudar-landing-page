"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LIMITS,
  NET_INDICATIVE_SUFFIX,
  formatMad,
  simulateAll,
} from "@/lib/finance";
import { DEFAULT_TICKET_MAD, clampTicket } from "@/lib/simulator";
import { ZelligePattern } from "@/components/brand/ZelligePattern";
import { AnimatedNumber } from "./AnimatedNumber";
import { TicketField } from "./TicketField";
import { IndicativeNotice } from "./IndicativeNotice";

/** Compact simulator for the home page: three Base numbers and a link to the full tool. */
export function HeroSimulator() {
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const all = useMemo(() => simulateAll(ticket), [ticket]);
  const base = all.base;
  const pessimistic = all.pessimistic;
  const mad = (n: number) => formatMad(n);

  const tiles = [
    { label: "Net cash per year", value: base.netCashYear1Mad },
    { label: `Net profit over ${LIMITS.HOLD_YEARS} years`, value: base.netProfitMad },
    { label: "Same money in a bank deposit", value: base.bankDepositProfitMad },
  ];

  return (
    <section aria-labelledby="hero-sim-title" className="relative bg-background px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="relative px-6 pb-8 pt-10 text-center sm:px-12">
          <ZelligePattern className="pointer-events-none absolute inset-0 text-primary opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
          <p className="relative text-sm font-semibold text-primary">Simulator</p>
          <h2
            id="hero-sim-title"
            className="relative mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Own real, rented property alongside professionals, from{" "}
            {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}.
          </h2>
        </div>

        <div className="grid gap-8 px-6 pb-8 sm:px-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
          <div className="lg:pt-2">
            <TicketField
              id="hero-amount"
              label="If I put in"
              value={ticket}
              onChange={(n) => setTicket(clampTicket(n, { max: LIMITS.MAX_PER_PROJECT_MAD }))}
              max={LIMITS.MAX_PER_PROJECT_MAD}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Base scenario, held {LIMITS.HOLD_YEARS} years. {NET_INDICATIVE_SUFFIX}.
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl bg-background p-4">
                <dt className="text-xs font-semibold text-muted-foreground">{t.label}</dt>
                <dd className="financial-number mt-2 text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedNumber value={t.value} format={mad} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-5 border-t border-border px-6 py-6 sm:px-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">The bad case, too.</span> In the Pessimistic scenario the
            same amount makes{" "}
            <span className="financial-number font-semibold text-foreground">{mad(pessimistic.netProfitMad)}</span> over{" "}
            {LIMITS.HOLD_YEARS} years
            {pessimistic.beatsBankDeposit ? "." : ", and a bank deposit would have earned more."}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/simulator"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Open the full simulator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/#how-your-money-moves"
              className="text-sm font-semibold text-primary underline underline-offset-2"
            >
              How is this calculated?
            </Link>
          </div>
          <IndicativeNotice />
        </div>
      </div>
    </section>
  );
}
