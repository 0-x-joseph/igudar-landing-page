"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChartNoAxesColumn, Clock, DoorOpen, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CountUp } from "@/components/CountUp";
import { MOTION, Reveal } from "@/components/motion";
import { LIMITS, MODEL_SCENARIOS, simulate } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { DEMO_PROPERTY } from "./fixture";

/** The three layers of the dossier; title and description live in `sections.dossier.layers.<key>`. */
const layers = [
  { key: "market", icon: ChartNoAxesColumn },
  { key: "risk", icon: ShieldCheck },
  { key: "match", icon: Sparkles },
] as const;

/** Risk chips: one icon and one word each, from `sections.dossier.risks.<id>`. */
const RISKS = [
  { id: "lateRent", icon: Clock },
  { id: "vacancy", icon: DoorOpen },
  { id: "price", icon: TrendingDown },
] as const;

/** Bars of the rent chart, left to right; labels come from `sections.dossier.chart.bars.<name>`. */
const BARS = [
  { name: "property", value: MODEL_SCENARIOS.base.grossYield, tone: "fill-primary" },
  { name: "district", value: DEMO_PROPERTY.districtGrossYield, tone: "fill-primary/35" },
  { name: "deposit", value: LIMITS.BANK_DEPOSIT_RATE, tone: "fill-foreground/25" },
] as const;

const CHART_H = 84;
const BAR_W = 46;
const CHART_MAX = Math.max(...BARS.map((b) => b.value)) * 1.12;

/** Inline-SVG bar chart: gross rent yield of this property against its district and a bank deposit. */
function RentChart() {
  const t = useTranslations("sections.dossier.chart");
  const { percent } = useFormat();
  const reduce = useReducedMotion();
  const desc = BARS.map((b) => `${t(`bars.${b.name}`)} ${percent(b.value)}`).join(", ");
  return (
    <svg
      data-chart="rent-vs-district"
      role="img"
      aria-label={t("label", { bars: desc })}
      viewBox="0 0 240 132"
      className="h-auto w-full max-w-xs"
    >
      <path d={`M8 ${CHART_H + 14} H232`} className="stroke-border" strokeWidth={1} />
      {BARS.map((b, i) => {
        const h = Math.round((b.value / CHART_MAX) * CHART_H);
        const x = 18 + i * 76;
        const y = CHART_H + 14 - h;
        return (
          <g key={b.name}>
            {reduce ? (
              <rect data-bar={b.name} data-value={b.value} x={x} y={y} width={BAR_W} height={h} rx={5} className={b.tone} />
            ) : (
              <motion.rect
                data-bar={b.name}
                data-value={b.value}
                x={x}
                width={BAR_W}
                rx={5}
                className={b.tone}
                initial={{ height: 0, y: CHART_H + 14 }}
                whileInView={{ height: h, y }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * MOTION.staggerS * 2, ease: MOTION.ease }}
              />
            )}
            <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-foreground">
              {percent(b.value)}
            </text>
            <text x={x + BAR_W / 2} y={CHART_H + 30} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground">
              {t(`bars.${b.name}`)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Meter() {
  const t = useTranslations("sections.dossier");
  const { filled, of } = DEMO_PROPERTY.suitability;
  const reduce = useReducedMotion();
  return (
    <div>
      <div
        role="meter"
        aria-label={t("meter.label")}
        aria-valuemin={0}
        aria-valuemax={of}
        aria-valuenow={filled}
        aria-valuetext={t("meter.valueText", { filled, of })}
        className="flex gap-1.5"
      >
        {Array.from({ length: of }, (_, i) => {
          const on = i < filled;
          const cls = `h-2.5 flex-1 rounded-full ${on ? "bg-primary" : "bg-muted"}`;
          return reduce || !on ? (
            <span key={i} className={cls} />
          ) : (
            <motion.span
              key={i}
              className={`${cls} origin-left rtl:origin-right`}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: MOTION.durationS, delay: i * MOTION.staggerS, ease: MOTION.ease }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("demo.profile")}</p>
    </div>
  );
}

function Visual({ layer }: { layer: (typeof layers)[number]["key"] }): ReactNode {
  const t = useTranslations("sections.dossier");
  if (layer === "market") {
    return (
      <div>
        <RentChart />
        <p className="mt-2 text-xs text-muted-foreground">{t("chart.note")}</p>
      </div>
    );
  }
  if (layer === "risk") {
    return (
      <ul className="flex flex-wrap gap-2">
        {RISKS.map(({ id, icon: Icon }) => (
          <li
            key={id}
            data-risk-chip=""
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
            {t(`risks.${id}`)}
          </li>
        ))}
      </ul>
    );
  }
  return <Meter />;
}

/**
 * "Clear data on every property": one mocked property whose dossier opens in three layers as it scrolls
 * into view. Hovering or focusing a layer lights it. The gross yield, net cash yield and IRR are the
 * engine's Base case at the minimum ticket; the district value and the profile are demo fixtures.
 */
export default function PropertyDossier() {
  const t = useTranslations("sections.dossier");
  const common = useTranslations("common");
  const { mad, percent } = useFormat();
  const scenarioLabel = useScenarioLabel();
  const [active, setActive] = useState<number | null>(null);
  const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });

  return (
    <div data-dossier="" className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/50 p-6 sm:p-8">
        <div>
          <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            {t("badge")}
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("demo.name")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("demo.where")}</p>
        </div>
        <div>
        <dl className="grid grid-cols-3 gap-x-6 text-sm sm:gap-x-8">
          <div>
            <dt className="text-xs text-muted-foreground">{t("stats.minTicket")}</dt>
            <dd className="financial-number text-base font-bold text-foreground">
              {mad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("stats.cashYield")}</dt>
            <dd className="financial-number text-base font-bold text-primary">
              <CountUp value={sim.netCashYieldYear1} format={(n) => percent(n)} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("stats.irr")}</dt>
            <dd className="financial-number text-base font-bold text-primary">
              <CountUp value={sim.netIrr ?? 0} format={(n) => percent(n)} />
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("stats.scenario", { scenario: scenarioLabel("base"), notice: common("notice.netIndicative") })}
        </p>
        </div>
      </div>

      <ol className="relative divide-y divide-border">
        {layers.map(({ key, icon: Icon }, i) => (
          <Reveal as="li" key={key} index={i}>
            <div
              data-layer={key}
              data-active={active === i}
              tabIndex={0}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((a) => (a === i ? null : a))}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((a) => (a === i ? null : a))}
              className="group relative grid gap-6 p-6 outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-[active=true]:bg-accent/50 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 start-0 w-1 origin-top bg-primary transition-transform duration-300 ease-out ${
                  active === i ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t(`layers.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`layers.${key}.desc`)}</p>
                </div>
              </div>
              <div className="flex items-center md:justify-end">
                <Visual layer={key} />
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

    </div>
  );
}
