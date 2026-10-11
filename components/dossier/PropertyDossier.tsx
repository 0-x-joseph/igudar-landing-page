"use client";

import { useState, type ReactNode } from "react";
import { ChartNoAxesColumn, Clock, DoorOpen, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CountUp } from "@/components/CountUp";
import { MOTION, Reveal } from "@/components/motion";
import { LIMITS, MODEL_SCENARIOS, NET_INDICATIVE_SUFFIX, formatMad, formatPercent, simulate } from "@/lib/finance";
import { DEMO_PROPERTY } from "./fixture";

const layers = [
  {
    key: "market",
    title: "Market Analysis",
    desc: "Real-time analysis of Moroccan real estate market trends and emerging opportunities.",
    icon: ChartNoAxesColumn,
  },
  {
    key: "risk",
    title: "Risk Assessment",
    desc: "A plain-language view of the main risks of each property, next to the numbers.",
    icon: ShieldCheck,
  },
  {
    key: "match",
    title: "Personalized Matching",
    desc: "Tailored recommendations based on your profile, goals, and risk tolerance.",
    icon: Sparkles,
  },
] as const;

const RISKS = [
  { word: "Late rent", icon: Clock },
  { word: "Vacancy", icon: DoorOpen },
  { word: "Price", icon: TrendingDown },
];

const BARS = [
  { name: "property", label: "This property", value: MODEL_SCENARIOS.base.grossYield, tone: "fill-primary" },
  { name: "district", label: "District", value: DEMO_PROPERTY.districtGrossYield, tone: "fill-primary/35" },
  { name: "deposit", label: "Bank deposit", value: LIMITS.BANK_DEPOSIT_RATE, tone: "fill-foreground/25" },
];

const CHART_H = 84;
const BAR_W = 46;
const CHART_MAX = Math.max(...BARS.map((b) => b.value)) * 1.12;

/** Inline-SVG bar chart: gross rent yield of this property against its district and a bank deposit. */
function RentChart() {
  const reduce = useReducedMotion();
  const desc = BARS.map((b) => `${b.label} ${formatPercent(b.value)}`).join(", ");
  return (
    <svg
      data-chart="rent-vs-district"
      role="img"
      aria-label={`Gross rent yield, example data: ${desc}`}
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
              {formatPercent(b.value)}
            </text>
            <text x={x + BAR_W / 2} y={CHART_H + 30} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Meter() {
  const { filled, of } = DEMO_PROPERTY.suitability;
  const reduce = useReducedMotion();
  return (
    <div>
      <div
        role="meter"
        aria-label="Suitability for the example profile, demo data"
        aria-valuemin={0}
        aria-valuemax={of}
        aria-valuenow={filled}
        aria-valuetext={`${filled} of ${of} segments`}
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
              className={`${cls} origin-left`}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: MOTION.durationS, delay: i * MOTION.staggerS, ease: MOTION.ease }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{DEMO_PROPERTY.profile}</p>
    </div>
  );
}

function Visual({ layer }: { layer: (typeof layers)[number]["key"] }): ReactNode {
  if (layer === "market") {
    return (
      <div>
        <RentChart />
        <p className="mt-2 text-xs text-muted-foreground">
          Gross rent yield, example data. The district figure is a demo value. Indicative.
        </p>
      </div>
    );
  }
  if (layer === "risk") {
    return (
      <ul className="flex flex-wrap gap-2">
        {RISKS.map(({ word, icon: Icon }) => (
          <li
            key={word}
            data-risk-chip=""
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
            {word}
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
  const [active, setActive] = useState<number | null>(null);
  const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });

  return (
    <div data-dossier="" className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/50 p-6 sm:p-8">
        <div>
          <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            Example · demo data
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {DEMO_PROPERTY.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{DEMO_PROPERTY.where}</p>
        </div>
        <div>
        <dl className="grid grid-cols-3 gap-x-6 text-sm sm:gap-x-8">
          <div>
            <dt className="text-xs text-muted-foreground">Minimum ticket</dt>
            <dd className="financial-number text-base font-bold text-foreground">
              {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Net cash yield</dt>
            <dd className="financial-number text-base font-bold text-primary">
              <CountUp value={sim.netCashYieldYear1} format={(n) => formatPercent(n)} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Net IRR</dt>
            <dd className="financial-number text-base font-bold text-primary">
              <CountUp value={sim.netIrr ?? 0} format={(n) => formatPercent(n)} />
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Base scenario, {NET_INDICATIVE_SUFFIX}</p>
        </div>
      </div>

      <ol className="relative divide-y divide-border">
        {layers.map(({ key, title, desc, icon: Icon }, i) => (
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
                className={`absolute inset-y-0 left-0 w-1 origin-top bg-primary transition-transform duration-300 ease-out ${
                  active === i ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
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
