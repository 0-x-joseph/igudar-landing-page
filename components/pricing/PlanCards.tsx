"use client";

import { useTranslations } from "next-intl";
import { FEE_GRID, LIMITS } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { PLANS, planFigures, type Plan, type PlanId } from "@/lib/plans";
import { CountUp } from "@/components/CountUp";
import { Hover, Reveal } from "@/components/motion";

type Row =
  | { kind: "fee"; id: string; label: string; value: string }
  | { kind: "planned"; id: string; label: string };

type T = ReturnType<typeof useTranslations<"pricing.plans">>;
type F = ReturnType<typeof useFormat>;

/** Lines that are in the published fee grid (D1, D2, D4), shown the same on every card. */
function gridFees(t: T, f: F): Row[] {
  return [
    { kind: "fee", id: "entry", label: t("fees.entry"), value: f.percent(FEE_GRID.D1_ENTRY, 0) },
    { kind: "fee", id: "platform", label: t("fees.platform"), value: t("fees.platformValue", { rate: f.percent(FEE_GRID.D2_PLATFORM_HT, 2) }) },
    { kind: "fee", id: "transfer", label: t("fees.transfer"), value: f.percent(FEE_GRID.D4_TRANSFER_HT) },
  ];
}

/** What each plan adds. Anything marked "planned" is not in the fee grid and states no amount. */
function extraFees(id: PlanId, t: T): Row[] {
  switch (id) {
    case "individual":
      return [
        { kind: "planned", id: "fileFee", label: t("fees.fileFee") },
        { kind: "planned", id: "lowerTransfer", label: t("fees.lowerTransfer") },
      ];
    case "family":
      return [
        { kind: "planned", id: "memberTransfers", label: t("fees.memberTransfers") },
        { kind: "planned", id: "volumeDiscount", label: t("fees.volumeDiscount") },
      ];
    default:
      return [];
  }
}

function serviceRows(id: PlanId, t: T, f: F): Row[] {
  const analytics = (amount: number): Row => ({
    kind: "fee",
    id: "analytics",
    label: t("fees.analytics"),
    value: t("fees.analyticsValue", { amount: f.mad(amount, { decimals: 0 }) }),
  });
  switch (id) {
    case "individual":
      return [analytics(FEE_GRID.D6_ANALYTICS_MAD.individual)];
    case "family":
      return [analytics(FEE_GRID.D6_ANALYTICS_MAD.premium)];
    default:
      return [analytics(FEE_GRID.D6_ANALYTICS_MAD.b2b), { kind: "planned", id: "anchorDiscount", label: t("fees.anchorDiscount") }];
  }
}

function ticketNotes(id: PlanId, t: T, f: F): { prefix?: string; notes: string[] } {
  switch (id) {
    case "individual":
      return { notes: [t("notes.individual.cap", { amount: f.mad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 }) })] };
    case "family":
      return { prefix: t("notes.family.prefix"), notes: [t("notes.family.addUp")] };
    default:
      return { notes: [t("notes.institutional.angels")] };
  }
}

function RowList({ rows, dark }: { rows: Row[]; dark: boolean }) {
  const t = useTranslations("pricing.plans");
  return (
    <dl className="mt-3 space-y-2.5 text-sm">
      {rows.map((r) =>
        r.kind === "fee" ? (
          <div key={r.id} className="flex items-baseline justify-between gap-4">
            <dt className={dark ? "text-white/70" : "text-muted-foreground"}>{r.label}</dt>
            <dd className="financial-number text-end font-semibold">{r.value}</dd>
          </div>
        ) : (
          <div
            key={r.id}
            data-planned=""
            className={`flex items-center justify-between gap-4 rounded-lg border border-dashed px-2.5 py-1.5 ${
              dark ? "border-white/20 text-white/50" : "border-border text-muted-foreground/70"
            }`}
          >
            <dt>{r.label}</dt>
            <dd
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                dark ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground"
              }`}
            >
              {t("planned")}
            </dd>
          </div>
        ),
      )}
    </dl>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("pricing.plans");
  const common = useTranslations("common");
  const f = useFormat();
  const scenario = useScenarioLabel();
  const dark = plan.id === "family";
  const { base, pessimistic } = planFigures(plan);
  const note = ticketNotes(plan.id, t, f);
  const muted = dark ? "text-white/70" : "text-muted-foreground";
  const label = `text-xs font-semibold uppercase tracking-wider ${muted}`;
  const pessimisticLabel = scenario("pessimistic");

  return (
    <Reveal as="li" index={index} className="h-full list-none">
      <Hover className="h-full">
        <article
          data-plan={plan.id}
          data-highlight={dark ? "true" : undefined}
          className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 sm:p-8 ${
            dark
              ? "border-primary/40 bg-foreground text-background shadow-[0_24px_60px_-28px_rgb(93_24_233/0.55)] lg:-my-4 lg:py-12"
              : "border-border bg-card text-foreground"
          }`}
        >
          {dark && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}
          <p className={`text-xs font-bold tracking-[0.18em] ${dark ? "text-[#B79CFF]" : "text-primary"}`}>
            {t(`items.${plan.id}.eyebrow`)}
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">{t(`items.${plan.id}.title`)}</h3>
          <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{t(`items.${plan.id}.audience`)}</p>

          <div className="mt-7">
            <p className={label}>{t("minimumTicket")}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="financial-number text-3xl font-bold tracking-tight">{f.mad(plan.ticketMad, { decimals: 0 })}</span>
              {note.prefix && <span className={`text-sm ${muted}`}>{note.prefix}</span>}
            </p>
            {note.notes.map((n) => (
              <p key={n} className={`text-sm ${muted}`}>
                {n}
              </p>
            ))}
          </div>

          <div className="mt-7">
            <p className={label}>{t("personalFees")}</p>
            <RowList rows={[...gridFees(t, f), ...extraFees(plan.id, t)]} dark={dark} />
          </div>

          <div className="mt-7">
            <p className={label}>{t("service")}</p>
            <RowList rows={serviceRows(plan.id, t, f)} dark={dark} />
          </div>

          <div className="mt-auto pt-8">
            <div className={`grid grid-cols-2 gap-4 border-t pt-6 ${dark ? "border-white/15" : "border-border"}`}>
              <div>
                <p className={`text-xs leading-snug ${muted}`}>{t("figures.netIrr")}</p>
                <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                  <span data-figure="irr">
                    <CountUp value={base.netIrr ?? 0} format={(n) => f.percent(n)} />
                  </span>
                </p>
                <p data-figure="irr-pessimistic" className={`financial-number mt-1 text-xs ${muted}`}>
                  {t("figures.pessimistic", {
                    scenario: pessimisticLabel,
                    value: pessimistic.netIrr === null ? t("figures.notAvailable") : f.percent(pessimistic.netIrr),
                  })}
                </p>
              </div>
              <div>
                <p className={`text-xs leading-snug ${muted}`}>{t("figures.totalGain", { years: f.number(LIMITS.HOLD_YEARS) })}</p>
                <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                  <span data-figure="gain">
                    <CountUp value={base.netProfitMad} format={(n) => f.mad(n, { decimals: 0 })} />
                  </span>
                </p>
                <p data-figure="gain-pessimistic" className={`financial-number mt-1 text-xs ${muted}`}>
                  {t("figures.pessimistic", { scenario: pessimisticLabel, value: f.mad(pessimistic.netProfitMad, { decimals: 0 }) })}
                </p>
              </div>
            </div>
          </div>
          <p className={`mt-4 text-[11px] ${muted}`}>{common("notice.netIndicative")}</p>
        </article>
      </Hover>
    </Reveal>
  );
}

/** "One property, three ways to invest": every figure is the engine's output at the plan's ticket. */
export default function PlanCards() {
  const t = useTranslations("pricing.plans");
  const f = useFormat();
  return (
    <div>
      <ul className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6" aria-label={t("ariaLabel")}>
        {PLANS.map((p, i) => (
          <PlanCard key={p.id} plan={p} index={i} />
        ))}
      </ul>
      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t("footnote", { years: f.number(LIMITS.HOLD_YEARS) })}
      </p>
    </div>
  );
}
