"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AGADIR_BODY, DETAIL, STROKE, door, doorRow } from "./BuildingSketch";
import { cn } from "@/lib/utils";

export const GRANARY_REGIONS = ["building", "chamber", "keeper", "rules"] as const;
export type GranaryRegion = (typeof GRANARY_REGIONS)[number];

/** Where each idea's number sits on the drawing, and where the pointer ring travels to. */
const MARKERS: Record<GranaryRegion, { x: number; y: number }> = {
  building: { x: 160, y: 50 },
  chamber: { x: 153, y: 128 },
  keeper: { x: 210, y: 243 },
  rules: { x: 352, y: 98 },
};

// The agadir is drawn at 1:1 inside a 440 x 290 frame, shifted right so the rules tablet has room beside it.
const SHIFT = "translate(40 14)";
const CHAMBER_DOOR = door(106, 160, 14, 26);
const KEEPER_DOOR = door(104, 244, 32, 52);
const TABLET = "M300 112 H404 A8 8 0 0 1 412 120 V214 A8 8 0 0 1 404 222 H300 A8 8 0 0 1 292 214 V120 A8 8 0 0 1 300 112 Z";

/**
 * The igudar story as one interactive line drawing: a shared granary tower, one chamber, the keeper's gate
 * and the tablet with the written rules. `active` lights one region and slides a ring to its number.
 * Decoration for the four cards beside it: aria-hidden, no information that the cards do not also say.
 */
export function GranarySketch({
  active,
  onSelect,
  className,
}: {
  active: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const gradId = `granary-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ease = reduce ? { duration: 0 } : { duration: 0.32, ease: [0, 0, 0.2, 1] as const };
  const ring = MARKERS[GRANARY_REGIONS[active] ?? "building"];

  const lit = (name: GranaryRegion) => GRANARY_REGIONS[active] === name;
  const fadeTo = (name: GranaryRegion) => ({ opacity: lit(name) ? 1 : 0 });

  return (
    <div data-granary="" aria-hidden="true" className={cn("select-none", className)}>
      <svg viewBox="0 0 440 290" focusable="false" className="h-auto w-full" role="presentation">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5D18E9" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Ground */}
        <path d="M20 258 H420" stroke="currentColor" strokeWidth={DETAIL} className="text-foreground/25" />

        {/* Quiet drawing: the whole granary in ink, thin lines. */}
        <g transform={SHIFT} className="text-foreground/35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d={AGADIR_BODY} fill={`url(#${gradId})`} strokeWidth={STROKE} />
          <g strokeWidth={STROKE}>
            <path d="M76 66 V54 H90 V66 M104 66 V54 H118 V66 M122 66 V54 H136 V66 M150 66 V54 H164 V66" />
            <path d="M30 244 H210" />
            <path d={doorRow([84, 106, 128, 150], 106, 12, 22)} />
            <path d={doorRow([74, 98, 122, 146], 160, 14, 26)} />
            <path d={doorRow([64, 90, 116, 142, 168], 214, 14, 28)} />
            <path d={KEEPER_DOOR} />
          </g>
          <g strokeWidth={DETAIL}>
            <path d="M62 118 H178 M52 170 H188" />
            <path d="M78 84 H162 M78 96 H162 M70 134 H170 M66 148 H174 M60 188 H180 M56 200 H184 M52 222 H188" strokeDasharray="3 5" />
          </g>
        </g>

        {/* The tablet, quiet: ruled lines like articles of an agreement. */}
        <g className="text-foreground/35" fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={TABLET} strokeWidth={STROKE} fill={`url(#${gradId})`} />
          <path d="M310 138 H394 M310 152 H394 M310 166 H376 M310 180 H394 M310 194 H360" strokeWidth={DETAIL} strokeDasharray="3 5" />
          <path d="M292 168 H262" strokeWidth={DETAIL} strokeDasharray="3 5" />
        </g>

        {/* Lit regions: violet strokes over the same shapes, faded in and out by `active`. */}
        <motion.g
          data-region="building"
          data-active={lit("building")}
          initial={false}
          animate={fadeTo("building")}
          transition={ease}
          transform={SHIFT}
          className="fill-accent stroke-primary"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={AGADIR_BODY} fillOpacity={0.55} />
          <path d="M76 66 V54 H90 V66 M104 66 V54 H118 V66 M122 66 V54 H136 V66 M150 66 V54 H164 V66" fill="none" />
        </motion.g>

        <motion.g
          data-region="chamber"
          data-active={lit("chamber")}
          initial={false}
          animate={fadeTo("chamber")}
          transition={ease}
          transform={SHIFT}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={CHAMBER_DOOR} />
          <path d="M98 160 H142 M98 134 H142" fill="none" strokeDasharray="3 5" strokeWidth={DETAIL} />
        </motion.g>

        <motion.g
          data-region="keeper"
          data-active={lit("keeper")}
          initial={false}
          animate={fadeTo("keeper")}
          transition={ease}
          transform={SHIFT}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={KEEPER_DOOR} />
          <circle cx={120} cy={228} r={2.4} className="fill-primary" />
        </motion.g>

        <motion.g
          data-region="rules"
          data-active={lit("rules")}
          initial={false}
          animate={fadeTo("rules")}
          transition={ease}
          className="fill-accent stroke-primary"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={TABLET} />
          <path d="M310 138 H394 M310 152 H394 M310 166 H376 M310 180 H394 M310 194 H360" fill="none" strokeWidth={DETAIL} />
          <path d="M292 168 H262" fill="none" strokeDasharray="3 5" strokeWidth={DETAIL} />
        </motion.g>

        {/* One ring that travels between the numbers. */}
        <motion.circle
          initial={false}
          animate={{ cx: ring.x, cy: ring.y }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
          r={17}
          fill="none"
          className="stroke-primary"
          strokeWidth={1.4}
        />
        {GRANARY_REGIONS.map((name, i) => {
          const m = MARKERS[name];
          const on = i === active;
          return (
            <g key={name} onMouseEnter={() => onSelect?.(i)} className={onSelect ? "cursor-pointer" : undefined}>
              <circle cx={m.x} cy={m.y} r={11} className={on ? "fill-primary stroke-primary" : "fill-card stroke-foreground/35"} strokeWidth={1.2} />
              <text
                x={m.x}
                y={m.y + 3.8}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                className={on ? "fill-white" : "fill-foreground/60"}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
