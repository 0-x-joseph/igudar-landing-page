"use client";

import { useTranslations } from "next-intl";
import { FEE_GRID, LIMITS, type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { PLANS, planFigures, type Plan } from "@/lib/plans";
import { CountUp } from "@/components/CountUp";
import { Hover, Reveal } from "@/components/motion";

type Row = { id: string; label: string; value: string };

type T = ReturnType<typeof useTranslations<"pricing.plans">>;
type F = ReturnType<typeof useFormat>;

/**
 * Fee lines in the published grid that reach the investor. Only D1 (structuring, at subscription) is paid
 * directly; D2 is taken inside the property company from the rent, before payouts; D4 only applies if you
 * sell early. Every number is read from the grid or the engine.
 */
function gridFees(t: T, f: F, base: SimulationResult): Row[] {
  return [
    {
      id: "entry",
      label: t("fees.entry"),
      value: t("fees.entryValue", { rate: f.percent(FEE_GRID.D1_ENTRY, 1), amount: f.mad(base.entryFeeMad, { decimals: 0 }) }),
    },
    { id: "outlay", label: t("fees.outlay"), value: f.mad(base.outlayMad, { decimals: 0 }) },
    { id: "platform", label: t("fees.platform"), value: t("fees.platformValue", { rate: f.percent(FEE_GRID.D2_PLATFORM_HT, 2) }) },
    { id: "transfer", label: t("fees.transfer"), value: f.percent(FEE_GRID.D4_TRANSFER_HT) },
  ];
}

function RowList({ rows }: { rows: Row[] }) {
  return (
    <dl className="mt-3 space-y-2.5 text-sm">
      {rows.map((r) => (
        <div key={r.id} className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className="financial-number text-end font-semibold">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("pricing.plans");
  const common = useTranslations("common");
  const f = useFormat();
  const scenario = useScenarioLabel();
  const { base, pessimistic } = planFigures(plan);
  const label = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
  const pessimisticLabel = scenario("pessimistic");

  return (
    <Reveal as="li" index={index} className="h-full list-none">
      <Hover className="h-full">
        <article
          data-plan={plan.id}
          className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 text-foreground sm:p-8"
        >
          <p className="text-xs font-bold tracking-[0.18em] text-primary">{t(`items.${plan.id}.eyebrow`)}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">{t(`items.${plan.id}.title`)}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`items.${plan.id}.audience`)}</p>

          <div className="mt-7">
            <p className={label}>{t("minimumTicket")}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="financial-number text-3xl font-bold tracking-tight">{f.mad(plan.ticketMad, { decimals: 0 })}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("notes.individual.cap", { amount: f.mad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 }) })}
            </p>
          </div>

          <div className="mt-7">
            <p className={label}>{t("personalFees")}</p>
            <RowList rows={gridFees(t, f, base)} />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("insideCompany")}</p>
          </div>

          <div className="mt-auto pt-8">
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div>
                <p className="text-xs leading-snug text-muted-foreground">{t("figures.netIrr")}</p>
                <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                  <span data-figure="irr">
                    <CountUp value={base.netIrr ?? 0} format={(n) => f.percent(n)} />
                  </span>
                </p>
                <p data-figure="irr-pessimistic" className="financial-number mt-1 text-xs text-muted-foreground">
                  {t("figures.pessimistic", {
                    scenario: pessimisticLabel,
                    value: pessimistic.netIrr === null ? t("figures.notAvailable") : f.percent(pessimistic.netIrr),
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs leading-snug text-muted-foreground">{t("figures.totalGain", { years: f.number(LIMITS.HOLD_YEARS) })}</p>
                <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                  <span data-figure="gain">
                    <CountUp value={base.netProfitMad} format={(n) => f.mad(n, { decimals: 0 })} />
                  </span>
                </p>
                <p data-figure="gain-pessimistic" className="financial-number mt-1 text-xs text-muted-foreground">
                  {t("figures.pessimistic", { scenario: pessimisticLabel, value: f.mad(pessimistic.netProfitMad, { decimals: 0 }) })}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">{common("notice.netIndicative")}</p>
        </article>
      </Hover>
    </Reveal>
  );
}

/**
 * "One property, one fee grid": the Individual ticket, every figure the engine's output at that ticket.
 * Family Circle, institutional and analytics plans are out of scope until Gate 3 and are not advertised.
 */
export default function PlanCards() {
  const t = useTranslations("pricing.plans");
  const f = useFormat();
  return (
    <div>
      <ul className="mx-auto grid max-w-xl items-stretch gap-5" aria-label={t("ariaLabel")}>
        {PLANS.map((p, i) => (
          <PlanCard key={p.id} plan={p} index={i} />
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t("footnote", { years: f.number(LIMITS.HOLD_YEARS) })}
      </p>
    </div>
  );
}
