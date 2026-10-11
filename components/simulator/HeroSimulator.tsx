"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, Coins, Landmark, Percent, Receipt, TrendingUp } from "lucide-react";
import {
  FEE_GRID,
  LIMITS,
  NET_INDICATIVE_SUFFIX,
  formatMad,
  formatPercent,
  simulateAll,
} from "@/lib/finance";
import { DEFAULT_TICKET_MAD, clampTicket } from "@/lib/simulator";
import { ReactiveGlow } from "@/components/brand";
import { CountUp } from "@/components/CountUp";
import { TicketField } from "./TicketField";
import { IndicativeNotice } from "./IndicativeNotice";

type Picto = ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean | "true" | "false" }>;

function PictoChip({ icon: Icon }: { icon: Picto }) {
  return (
    <span
      data-picto=""
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-200 ease-out group-hover/tile:scale-110"
    >
      <Icon className="size-[1.125rem]" strokeWidth={1.7} aria-hidden="true" />
    </span>
  );
}

/** Compact simulator for the home page: four Base results with the Pessimistic case beside them. */
export function HeroSimulator() {
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const all = useMemo(() => simulateAll(ticket), [ticket]);
  const base = all.base;
  const pessimistic = all.pessimistic;
  const mad = (n: number) => formatMad(n);
  const irr = (n: number | null) => (n === null ? "n/a" : formatPercent(n, 2));
  const platformFee = base.feeLines.find((l) => l.code === "D2")?.amountMad ?? 0;

  const tiles: Array<{
    label: string;
    icon: Picto;
    value: number | null;
    format: (n: number) => string;
    worse?: string;
  }> = [
    { label: "Net cash per year", icon: Coins, value: base.netCashYear1Mad, format: mad, worse: mad(pessimistic.netCashYear1Mad) },
    { label: `Net profit over ${LIMITS.HOLD_YEARS} years`, icon: TrendingUp, value: base.netProfitMad, format: mad, worse: mad(pessimistic.netProfitMad) },
    { label: "Net IRR", icon: Percent, value: base.netIrr, format: (n) => formatPercent(n, 2), worse: irr(pessimistic.netIrr) },
    { label: "Platform fee per year", icon: Receipt, value: platformFee, format: mad },
  ];

  return (
    <section aria-labelledby="hero-sim-title" className="relative bg-surface-sand px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card lg:max-w-6xl">
        <div className="group relative px-6 pb-8 pt-10 text-center sm:px-12">
          <ReactiveGlow className="inset-0" />
          <p className="relative text-sm font-semibold text-primary">Simulator</p>
          <h2
            id="hero-sim-title"
            className="relative mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Own real, rented property alongside professionals, from{" "}
            {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}.
          </h2>
        </div>

        <div className="grid gap-8 px-6 pb-8 sm:px-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12 lg:px-14">
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

          <dl className="grid gap-4 sm:grid-cols-2">
            {tiles.map((t, i) => (
              <div
                key={t.label}
                data-result-tile=""
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                className="group/tile min-w-0 animate-fade-in-up rounded-2xl bg-surface-sand p-5"
              >
                <div className="flex items-center gap-3">
                  <PictoChip icon={t.icon} />
                  <dt className="min-w-0 text-xs font-semibold leading-snug text-muted-foreground">{t.label}</dt>
                </div>
                <dd className="mt-4">
                  <p className="financial-number min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-[1.375rem]">
                    {t.value === null ? "n/a" : <CountUp value={t.value} format={t.format} />}
                  </p>
                  {t.worse !== undefined ? (
                    <p data-pessimistic="" className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Pessimistic{" "}
                      <span className="financial-number font-semibold text-foreground">{t.worse}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Entry fee {formatPercent(FEE_GRID.D1_ENTRY, 0)}. Same in every scenario.
                    </p>
                  )}
                </dd>
              </div>
            ))}
            <div
              data-compare-tile=""
              style={{ animationDelay: "320ms", animationFillMode: "both" }}
              className="group/tile min-w-0 animate-fade-in-up rounded-2xl border border-dashed border-border p-5 sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <PictoChip icon={Landmark} />
                <dt className="min-w-0 text-xs font-semibold leading-snug text-muted-foreground">
                  Same money in a bank deposit
                </dt>
              </div>
              <dd className="financial-number mt-4 text-xl font-bold tracking-tight text-foreground sm:text-[1.375rem]">
                <CountUp value={base.bankDepositProfitMad} format={mad} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-5 border-t border-border px-6 py-6 sm:px-10 lg:px-14">
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
