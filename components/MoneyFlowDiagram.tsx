"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { LIMITS } from "@/lib/finance";

const M = LIMITS.EXIT_WINDOW_MONTHS;
const Y = LIMITS.EXIT_LOCK_YEARS;
const H = LIMITS.HOLD_YEARS;

type Tone = "default" | "escrow" | "refund" | "received";

interface FlowNode {
  id: string;
  /** Step number shown in the badge; "or" marks the alternative branch. */
  step: string;
  title: string;
  lines: string[];
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
  labels?: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }[];
}

interface Layout {
  viewBox: string;
  titleSize: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const DESKTOP: Layout = {
  viewBox: "0 0 1020 548",
  titleSize: 14,
  nodes: [
    { id: "you", step: "1", title: "You", lines: ["You commit an amount and", "transfer it from your", "own bank account"], x: 10, y: 20, w: 190, h: 112, tone: "default" },
    { id: "escrow", step: "2", title: "Escrow account", lines: ["Held at a regulated bank,", "one account per project.", "Not spent until it closes"], x: 280, y: 20, w: 190, h: 112, tone: "escrow" },
    { id: "sas", step: "3", title: "Property company", lines: ["Buys the property when", "the raise hits its target.", "You hold shares in it"], x: 550, y: 20, w: 190, h: 112, tone: "default" },
    { id: "property", step: "4", title: "Property", lines: ["Rented to a professional", "operator under a", "master lease"], x: 820, y: 20, w: 190, h: 112, tone: "default" },
    { id: "refund", step: "or", title: "Full refund", lines: ["If the raise fails or the", "deadline passes, the bank", "returns all your money"], x: 280, y: 216, w: 190, h: 112, tone: "refund" },
    { id: "rent", step: "5", title: "Rent", lines: ["Reserve, taxes and the", "platform fee come out", "of the rent first"], x: 820, y: 216, w: 190, h: 112, tone: "default" },
    { id: "net", step: "6", title: "Net distribution", lines: ["What is left is paid to", "your bank account, after", "fees and taxes"], x: 550, y: 216, w: 190, h: 112, tone: "received" },
    { id: "exit", step: "7", title: "Your capital back", lines: [`Windows every ${M} months`, `after year ${Y}; sale or`, `block sale about year ${H}.`, "Price may rise or fall"], x: 550, y: 416, w: 190, h: 112, tone: "default" },
  ],
  edges: [
    { id: "e1", d: "M200,76 L278,76", labels: [{ x: 239, y: 66, text: "transfer", anchor: "middle" }] },
    {
      id: "e2",
      d: "M470,76 L548,76",
      labels: [
        { x: 509, y: 62, text: "target", anchor: "middle" },
        { x: 509, y: 98, text: "reached", anchor: "middle" },
      ],
    },
    { id: "e3", d: "M740,76 L818,76", labels: [{ x: 779, y: 66, text: "buys", anchor: "middle" }] },
    { id: "e4", d: "M375,132 L375,214", dashed: true, labels: [{ x: 387, y: 178, text: "raise fails or deadline passes", anchor: "start" }] },
    { id: "e5", d: "M915,132 L915,214", labels: [{ x: 903, y: 178, text: "operator pays rent", anchor: "end" }] },
    { id: "e6", d: "M820,272 L742,272" },
    { id: "e7", d: "M645,328 L645,414", labels: [{ x: 657, y: 376, text: "exit windows", anchor: "start" }] },
  ],
};

const MOBILE: Layout = {
  viewBox: "0 0 360 964",
  titleSize: 13.5,
  nodes: [
    { id: "you", step: "1", title: "You", lines: ["You commit an amount and transfer it from", "your own bank account"], x: 10, y: 10, w: 340, h: 96, tone: "default" },
    { id: "escrow", step: "2", title: "Escrow account", lines: ["Held at a regulated bank, one account per", "project. Not spent until the raise closes"], x: 10, y: 146, w: 340, h: 96, tone: "escrow" },
    { id: "sas", step: "3", title: "Property company", lines: ["Buys the property", "when the raise hits", "its target. You hold", "shares in the SAS"], x: 10, y: 282, w: 165, h: 118, tone: "default" },
    { id: "refund", step: "or", title: "Full refund", lines: ["If the raise fails or", "the deadline passes,", "the bank returns all", "your money"], x: 185, y: 282, w: 165, h: 118, tone: "refund" },
    { id: "property", step: "4", title: "Property", lines: ["Rented to a professional operator under a", "master lease"], x: 10, y: 440, w: 340, h: 96, tone: "default" },
    { id: "rent", step: "5", title: "Rent", lines: ["Reserve, taxes and the platform fee come", "out of the rent first"], x: 10, y: 576, w: 340, h: 96, tone: "default" },
    { id: "net", step: "6", title: "Net distribution", lines: ["What is left is paid to your bank account,", "after fees and taxes"], x: 10, y: 712, w: 340, h: 96, tone: "received" },
    { id: "exit", step: "7", title: "Your capital back", lines: [`Exit windows every ${M} months after year ${Y};`, `sale or block sale around year ${H}.`, "The property price may rise or fall."], x: 10, y: 848, w: 340, h: 106, tone: "default" },
  ],
  edges: [
    { id: "e1", d: "M180,106 L180,144", labels: [{ x: 192, y: 130, text: "transfer", anchor: "start" }] },
    { id: "e2", d: "M92,242 L92,280", labels: [{ x: 102, y: 266, text: "target reached", anchor: "start" }] },
    { id: "e4", d: "M268,242 L268,280", dashed: true, labels: [{ x: 278, y: 266, text: "raise fails", anchor: "start" }] },
    { id: "e3", d: "M92,400 L92,438", labels: [{ x: 102, y: 424, text: "buys", anchor: "start" }] },
    { id: "e5", d: "M180,536 L180,574", labels: [{ x: 192, y: 560, text: "operator pays rent", anchor: "start" }] },
    { id: "e6", d: "M180,672 L180,710" },
    { id: "e7", d: "M180,808 L180,846", labels: [{ x: 192, y: 832, text: "exit windows", anchor: "start" }] },
  ],
};

const NODE_CLASSES: Record<Tone, string> = {
  default: "fill-card stroke-border",
  escrow: "fill-accent stroke-primary",
  refund: "fill-background stroke-muted-foreground",
  received: "fill-card stroke-success",
};

function Diagram({ layout, label }: { layout: Layout; label: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const markerId = `${uid}-arrow`;

  return (
    <svg viewBox={layout.viewBox} role="img" aria-label={label} className="h-auto w-full">
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
            <text key={l.text} x={l.x} y={l.y} textAnchor={l.anchor ?? "middle"} fontSize={11} className="fill-muted-foreground">
              {l.text}
            </text>
          ))}
        </motion.g>
      ))}

      {layout.nodes.map((n, i) => (
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
          <circle cx={n.x + 24} cy={n.y + 26} r={12} className="fill-foreground" />
          <text x={n.x + 24} y={n.y + 26} textAnchor="middle" dominantBaseline="central" fontSize={n.step === "or" ? 9 : 12} fontWeight={700} className="fill-background">
            {n.step}
          </text>
          <text x={n.x + 44} y={n.y + 26} dominantBaseline="central" fontSize={layout.titleSize} fontWeight={700} className="fill-foreground">
            {n.title}
          </text>
          {n.lines.map((line, li) => (
            <text key={li} x={n.x + 16} y={n.y + 58 + li * 17} fontSize={12} className="fill-muted-foreground">
              {line}
            </text>
          ))}
        </motion.g>
      ))}
    </svg>
  );
}

const STEPS_TEXT = [
  "You transfer your amount from your own bank account to an escrow account at a regulated bank, one account per project.",
  "If the raise reaches its target, the property company (SAS) buys the property. If it fails or the deadline passes, the bank refunds you in full.",
  "The property is rented to a professional operator under a master lease.",
  "Rent first pays the reserve, taxes and the platform fee. What is left is paid to your bank account as a net distribution.",
  `Exit windows open every ${M} months after the first year. The property is sold, or sold in a block, around year ${H}, and you get your capital back plus or minus the change in the property value.`,
];

/** The escrow money-flow diagram. Two layouts (wide and tall) so text stays readable on a phone. */
export default function MoneyFlowDiagram() {
  const label = "How your money moves, from your bank account to the escrow account, the property company, the rent and back to you.";
  return (
    <div>
      <div className="hidden md:block">
        <Diagram layout={DESKTOP} label={label} />
      </div>
      <div className="md:hidden">
        <Diagram layout={MOBILE} label={label} />
      </div>
      <ol className="sr-only">
        {STEPS_TEXT.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
    </div>
  );
}
