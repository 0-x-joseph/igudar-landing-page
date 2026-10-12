"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import { LIMITS } from "@/lib/finance";
import { LOCALE_META, isLocale } from "@/i18n/routing";

/** Numbers the diagram's words quote; the same placeholders exist in every language file. */
const VALUES = {
  months: LIMITS.EXIT_WINDOW_MONTHS,
  lockYears: LIMITS.EXIT_LOCK_YEARS,
  holdYears: LIMITS.HOLD_YEARS,
};

type Tone = "default" | "escrow" | "refund" | "received";
type NodeId = "you" | "escrow" | "sas" | "property" | "refund" | "rent" | "net" | "exit";
type EdgeLabel =
  | "transfer"
  | "target"
  | "reached"
  | "targetReached"
  | "buys"
  | "raiseFails"
  | "raiseFailsOrDeadline"
  | "operatorPaysRent"
  | "exitWindows";
type Anchor = "start" | "middle" | "end";

interface FlowNode {
  /** Also the message key: `sections.flow.nodes.<id>` carries the title and the wrapped body for each layout. */
  id: NodeId;
  /** Step number shown in the badge; "or" marks the alternative branch. */
  step: number | "or";
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
}

interface FlowEdge {
  id: string;
  d: string;
  dashed?: boolean;
  labels?: { x: number; y: number; key: EdgeLabel; anchor?: Anchor }[];
}

interface Layout {
  viewBox: string;
  titleSize: number;
  /** Which pre-wrapped body each node reads: lines are broken in the message file to fit this layout's boxes. */
  body: "wide" | "tall";
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const DESKTOP: Layout = {
  viewBox: "0 0 1020 548",
  titleSize: 14,
  body: "wide",
  nodes: [
    { id: "you", step: 1, x: 10, y: 20, w: 190, h: 112, tone: "default" },
    { id: "escrow", step: 2, x: 280, y: 20, w: 190, h: 112, tone: "escrow" },
    { id: "sas", step: 3, x: 550, y: 20, w: 190, h: 112, tone: "default" },
    { id: "property", step: 4, x: 820, y: 20, w: 190, h: 112, tone: "default" },
    { id: "refund", step: "or", x: 280, y: 216, w: 190, h: 112, tone: "refund" },
    { id: "rent", step: 5, x: 820, y: 216, w: 190, h: 112, tone: "default" },
    { id: "net", step: 6, x: 550, y: 216, w: 190, h: 112, tone: "received" },
    { id: "exit", step: 7, x: 550, y: 416, w: 190, h: 112, tone: "default" },
  ],
  edges: [
    { id: "e1", d: "M200,76 L278,76", labels: [{ x: 239, y: 66, key: "transfer", anchor: "middle" }] },
    {
      id: "e2",
      d: "M470,76 L548,76",
      labels: [
        { x: 509, y: 62, key: "target", anchor: "middle" },
        { x: 509, y: 98, key: "reached", anchor: "middle" },
      ],
    },
    { id: "e3", d: "M740,76 L818,76", labels: [{ x: 779, y: 66, key: "buys", anchor: "middle" }] },
    { id: "e4", d: "M375,132 L375,214", dashed: true, labels: [{ x: 387, y: 178, key: "raiseFailsOrDeadline", anchor: "start" }] },
    { id: "e5", d: "M915,132 L915,214", labels: [{ x: 903, y: 178, key: "operatorPaysRent", anchor: "end" }] },
    { id: "e6", d: "M820,272 L742,272" },
    { id: "e7", d: "M645,328 L645,414", labels: [{ x: 657, y: 376, key: "exitWindows", anchor: "start" }] },
  ],
};

const MOBILE: Layout = {
  viewBox: "0 0 360 964",
  titleSize: 13.5,
  body: "tall",
  nodes: [
    { id: "you", step: 1, x: 10, y: 10, w: 340, h: 96, tone: "default" },
    { id: "escrow", step: 2, x: 10, y: 146, w: 340, h: 96, tone: "escrow" },
    { id: "sas", step: 3, x: 10, y: 282, w: 165, h: 118, tone: "default" },
    { id: "refund", step: "or", x: 185, y: 282, w: 165, h: 118, tone: "refund" },
    { id: "property", step: 4, x: 10, y: 440, w: 340, h: 96, tone: "default" },
    { id: "rent", step: 5, x: 10, y: 576, w: 340, h: 96, tone: "default" },
    { id: "net", step: 6, x: 10, y: 712, w: 340, h: 96, tone: "received" },
    { id: "exit", step: 7, x: 10, y: 848, w: 340, h: 106, tone: "default" },
  ],
  edges: [
    { id: "e1", d: "M180,106 L180,144", labels: [{ x: 192, y: 130, key: "transfer", anchor: "start" }] },
    { id: "e2", d: "M92,242 L92,280", labels: [{ x: 102, y: 266, key: "targetReached", anchor: "start" }] },
    { id: "e4", d: "M268,242 L268,280", dashed: true, labels: [{ x: 278, y: 266, key: "raiseFails", anchor: "start" }] },
    { id: "e3", d: "M92,400 L92,438", labels: [{ x: 102, y: 424, key: "buys", anchor: "start" }] },
    { id: "e5", d: "M180,536 L180,574", labels: [{ x: 192, y: 560, key: "operatorPaysRent", anchor: "start" }] },
    { id: "e6", d: "M180,672 L180,710" },
    { id: "e7", d: "M180,808 L180,846", labels: [{ x: 192, y: 832, key: "exitWindows", anchor: "start" }] },
  ],
};

const NODE_CLASSES: Record<Tone, string> = {
  default: "fill-card stroke-border",
  escrow: "fill-accent stroke-primary",
  refund: "fill-background stroke-muted-foreground",
  received: "fill-card stroke-success",
};

/** The sr-only walkthrough, in reading order: `sections.flow.steps.<id>`. */
const STEPS = ["transfer", "close", "lease", "rent", "exit"] as const;

/**
 * In a right-to-left page SVG text runs from its anchor leftwards, so a label that sat to the right of
 * an arrow in English would cross it. Mirroring `start` and `end` keeps every label on the same side
 * of its line; nothing else in the geometry changes.
 */
function mirror(anchor: Anchor, rtl: boolean): Anchor {
  if (!rtl || anchor === "middle") return anchor;
  return anchor === "start" ? "end" : "start";
}

function Diagram({ layout, label, rtl }: { layout: Layout; label: string; rtl: boolean }) {
  const t = useTranslations("sections.flow");
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const markerId = `${uid}-arrow`;

  return (
    <svg viewBox={layout.viewBox} role="img" aria-label={label} direction={rtl ? "rtl" : undefined} className="h-auto w-full">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {layout.edges.map((edge, i) => (
        <motion.g
          key={edge.id}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
        >
          <path
            d={edge.d}
            fill="none"
            className="stroke-muted-foreground"
            strokeWidth={1.5}
            strokeDasharray={edge.dashed ? "5 4" : undefined}
            markerEnd={`url(#${markerId})`}
          />
          {edge.labels?.map((l) => (
            <text key={l.key} x={l.x} y={l.y} textAnchor={mirror(l.anchor ?? "middle", rtl)} fontSize={11} className="fill-muted-foreground">
              {t(`edges.${l.key}`)}
            </text>
          ))}
        </motion.g>
      ))}

      {layout.nodes.map((n, i) => {
        // Text starts at the box's reading edge: the left in English and French, the right in Arabic.
        const edge = rtl ? n.x + n.w : n.x;
        const inset = (px: number) => (rtl ? edge - px : edge + px);
        const lines = t(`nodes.${n.id}.${layout.body}`, VALUES).split("\n");
        return (
          <motion.g
            key={n.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={18}
              className={NODE_CLASSES[n.tone]}
              strokeWidth={n.tone === "received" || n.tone === "escrow" ? 2 : 1.5}
              strokeDasharray={n.tone === "refund" ? "6 5" : undefined}
            />
            <circle cx={inset(24)} cy={n.y + 26} r={12} className="fill-foreground" />
            <text x={inset(24)} y={n.y + 26} textAnchor="middle" dominantBaseline="central" fontSize={n.step === "or" ? 9 : 12} fontWeight={700} className="fill-background">
              {n.step === "or" ? t("or") : n.step}
            </text>
            <text x={inset(44)} y={n.y + 26} dominantBaseline="central" fontSize={layout.titleSize} fontWeight={700} className="fill-foreground">
              {t(`nodes.${n.id}.title`)}
            </text>
            {lines.map((line, li) => (
              <text key={li} x={inset(16)} y={n.y + 58 + li * 17} fontSize={12} className="fill-muted-foreground">
                {line}
              </text>
            ))}
          </motion.g>
        );
      })}
    </svg>
  );
}

/** The escrow money-flow diagram. Two layouts (wide and tall) so text stays readable on a phone. */
export default function MoneyFlowDiagram() {
  const t = useTranslations("sections.flow");
  const locale = useLocale();
  const rtl = isLocale(locale) && LOCALE_META[locale].dir === "rtl";
  const label = t("label");
  return (
    <div>
      <div className="hidden md:block">
        <Diagram layout={DESKTOP} label={label} rtl={rtl} />
      </div>
      <div className="md:hidden">
        <Diagram layout={MOBILE} label={label} rtl={rtl} />
      </div>
      <ol className="sr-only">
        {STEPS.map((id) => (
          <li key={id}>{t(`steps.${id}`, VALUES)}</li>
        ))}
      </ol>
    </div>
  );
}
