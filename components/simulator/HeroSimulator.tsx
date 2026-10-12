"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Coins, Landmark, Percent, Receipt, TrendingUp } from "lucide-react";
import { FEE_GRID, LIMITS, simulateAll } from "@/lib/finance";
import { Link } from "@/i18n/navigation";
import { useFormat } from "@/lib/i18n/use-format";
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
  const t = useTranslations("simulator.hero");
  const ts = useTranslations("simulator");
  const tc = useTranslations("common");
  const { mad: formatMad, percent } = useFormat();
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const all = useMemo(() => simulateAll(ticket), [ticket]);
  const base = all.base;
  const pessimistic = all.pessimistic;
  const years = LIMITS.HOLD_YEARS;
  const mad = (n: number) => formatMad(n);
  const irr = (n: number | null) => (n === null ? ts("na") : percent(n, 2));
  const platformFee = base.feeLines.find((l) => l.code === "D2")?.amountMad ?? 0;

  const tiles: Array<{
    id: string;
    label: string;
    icon: Picto;
    value: number | null;
    format: (n: number) => string;
    worse?: string;
  }> = [
    { id: "netCash", label: t("tiles.netCash"), icon: Coins, value: base.netCashYear1Mad, format: mad, worse: mad(pessimistic.netCashYear1Mad) },
    { id: "netProfit", label: t("tiles.netProfit", { years }), icon: TrendingUp, value: base.netProfitMad, format: mad, worse: mad(pessimistic.netProfitMad) },
    { id: "netIrr", label: t("tiles.netIrr"), icon: Percent, value: base.netIrr, format: (n) => percent(n, 2), worse: irr(pessimistic.netIrr) },
    { id: "platformFee", label: t("tiles.platformFee"), icon: Receipt, value: platformFee, format: mad },
  ];

  return (
    <section aria-labelledby="hero-sim-title" className="relative bg-surface-sand px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card lg:max-w-6xl">
        <div className="group relative px-6 pb-8 pt-10 text-center sm:px-12">
          <ReactiveGlow className="inset-0" />
          <p className="relative text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h2
            id="hero-sim-title"
            className="relative mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {t("title", { min: formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 }) })}
          </h2>
        </div>

        <div className="grid gap-8 px-6 pb-8 sm:px-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12 lg:px-14">
          <div className="lg:pt-2">
            <TicketField
              id="hero-amount"
              label={t("amountLabel")}
              value={ticket}
              onChange={(n) => setTicket(clampTicket(n, { max: LIMITS.MAX_PER_PROJECT_MAD }))}
              max={LIMITS.MAX_PER_PROJECT_MAD}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t("assumptions", { years, suffix: tc("notice.netIndicative") })}
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {tiles.map((tile, i) => (
              <div
                key={tile.id}
                data-result-tile=""
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                className="group/tile min-w-0 animate-fade-in-up rounded-2xl bg-surface-sand p-5"
              >
                <div className="flex items-center gap-3">
                  <PictoChip icon={tile.icon} />
                  <dt className="min-w-0 text-xs font-semibold leading-snug text-muted-foreground">{tile.label}</dt>
                </div>
                <dd className="mt-4">
                  <p className="financial-number min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-[1.375rem]">
                    {tile.value === null ? ts("na") : <CountUp value={tile.value} format={tile.format} />}
                  </p>
                  {tile.worse !== undefined ? (
                    <p data-pessimistic="" className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t("pessimistic")}{" "}
                      <span className="financial-number font-semibold text-foreground">{tile.worse}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t("entryFee", { rate: percent(FEE_GRID.D1_ENTRY, 0) })}
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
                <dt className="min-w-0 text-xs font-semibold leading-snug text-muted-foreground">{t("bankDeposit")}</dt>
              </div>
              <dd className="financial-number mt-4 text-xl font-bold tracking-tight text-foreground sm:text-[1.375rem]">
                <CountUp value={base.bankDepositProfitMad} format={mad} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-5 border-t border-border px-6 py-6 sm:px-10 lg:px-14">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{t("badCaseLead")}</span>{" "}
            {t.rich(pessimistic.beatsBankDeposit ? "badCaseBeats" : "badCaseLoses", {
              profit: mad(pessimistic.netProfitMad),
              years,
              strong: (chunks) => <span className="financial-number font-semibold text-foreground">{chunks}</span>,
            })}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/simulator"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("openFull")}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <Link href="/#how-your-money-moves" className="text-sm font-semibold text-primary underline underline-offset-2">
              {t("howCalculated")}
            </Link>
          </div>
          <IndicativeNotice />
        </div>
      </div>
    </section>
  );
}
