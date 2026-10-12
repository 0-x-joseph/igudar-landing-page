"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { TAX, type RentBridge as RentBridgeData, type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { AnimatedNumber } from "./AnimatedNumber";

interface Segment {
  id: keyof RentBridgeData;
  /** Swatch and bar colour: neutral tokens, violet only for "you". */
  fill: string;
  /** Text colour used when the figure is printed inside the bar. */
  ink: string;
}

/** Order and colours of the five parts; their names and notes live in `simulator.bridge.segments`. */
const SEGMENTS: readonly Segment[] = [
  { id: "reserveVacancy", fill: "bg-muted-foreground/30", ink: "text-foreground" },
  { id: "platformFee", fill: "bg-highlight", ink: "text-highlight-foreground" },
  { id: "is", fill: "bg-foreground/80", ink: "text-background" },
  { id: "withholding", fill: "bg-foreground/45", ink: "text-background" },
  { id: "investor", fill: "bg-primary", ink: "text-primary-foreground" },
];

const LABEL_MIN_SHARE = 10;

/** Logical corners: the first segment sits at the start of the row (right-hand side in Arabic). */
function radius(i: number): string {
  if (i === 0) return "rounded-s-2xl rounded-e-[3px]";
  if (i === SEGMENTS.length - 1) return "rounded-e-2xl rounded-s-[3px]";
  return "rounded-[3px]";
}
const TICKS = [0, 25, 50, 75, 100];

/** "Where your rent goes": every 100 MAD of year-1 rent, split into five labelled parts. */
export function RentBridge({ result }: { result: SimulationResult }) {
  const t = useTranslations("simulator.bridge");
  const scenarioLabel = useScenarioLabel();
  const { mad, number, percent } = useFormat();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const show = reduce || inView;
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const bridge = result.rentBridge;
  const hundred = mad(100, { decimals: 0 });
  const segmentName = (id: Segment["id"]) => t(`segments.${id}.name`);
  const segmentNote = (id: Segment["id"]) => t(`segments.${id}.note`, { rate: percent(TAX.WITHHOLDING_INDIVIDUAL, 0) });

  return (
    <section aria-labelledby="sim-bridge-title" className="rounded-3xl border border-border bg-card p-5 sm:p-8">
      <h2 id="sim-bridge-title" className="text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro", { hundred, scenario: scenarioLabel(key) })}</p>

      <p className="mt-6 text-lg text-foreground sm:text-xl">
        {t.rich("keep", {
          hundred,
          share: () => (
            <span className="financial-number text-3xl font-bold text-primary sm:text-4xl">
              <AnimatedNumber value={bridge.investor} format={(n) => number(n, 1)} />
            </span>
          ),
        })}
      </p>

      <div ref={ref} className="mt-5">
        {/* A flex row follows the page direction: the first part starts at the right in Arabic, with the ticks below. */}
        <div
          role="img"
          aria-label={SEGMENTS.map((s) => `${segmentName(s.id)} ${mad(bridge[s.id], { decimals: 1 })}`).join(", ")}
          className="flex h-14 w-full gap-[3px] sm:h-16"
        >
          {SEGMENTS.map((s, i) => {
            const v = bridge[s.id];
            return (
              <motion.div
                key={s.id}
                className={`flex min-w-0 items-center justify-center overflow-hidden ${s.fill} ${radius(i)}`}
                initial={reduce ? false : { width: "0%", opacity: 0 }}
                animate={{ width: show ? `${v}%` : "0%", opacity: show ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {v >= LABEL_MIN_SHARE && (
                  <span className={`financial-number whitespace-nowrap text-sm font-bold sm:text-base ${s.ink}`}>
                    {number(v, 1)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div aria-hidden="true" className="relative mt-1 flex justify-between text-[11px] text-muted-foreground">
          {TICKS.map((tick) => (
            <span key={tick} className="financial-number">
              {tick}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
        {SEGMENTS.map((s) => (
          <li key={s.id} className="flex min-w-0 gap-3">
            <span className={`mt-1 size-3.5 shrink-0 rounded-md ${s.fill}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{segmentName(s.id)}</p>
              <p className="financial-number text-base font-bold text-foreground break-words">
                {mad(bridge[s.id], { decimals: 1 })}
              </p>
              <p className="text-xs leading-snug text-muted-foreground">{segmentNote(s.id)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
