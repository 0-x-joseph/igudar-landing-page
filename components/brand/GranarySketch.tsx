"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DETAIL, STROKE, door, doorRow, merlons } from "./BuildingSketch";
import { cn } from "@/lib/utils";

export const GRANARY_REGIONS = ["building", "chamber", "keeper", "rules"] as const;
export type GranaryRegion = (typeof GRANARY_REGIONS)[number];

/** Where each idea's number sits on the drawing, and where the pointer ring travels to. */
const MARKERS: Record<GranaryRegion, { x: number; y: number }> = {
  building: { x: 200, y: 58 },
  chamber: { x: 92, y: 378 },
  keeper: { x: 266, y: 488 },
  rules: { x: 266, y: 322 },
};

// Drawn 1:1 in a 400 x 560 portrait frame, so the card stands as tall as the four ideas beside it.
const GROUND = 520;

/** The tapering earthen tower of a kasbah: wider at the foot, narrower at the crown. */
const TOWER = `M100 ${GROUND} L122 112 L278 112 L300 ${GROUND} Z`;
/** Two corner pinnacles either side of the crenellated parapet. */
const PINNACLES = "M118 112 V94 H136 V112 M264 112 V94 H282 V112";
const PARAPET = merlons(136, 264, 112, 12.8);

/** A row of carved lozenges, the relief pattern of the Draa and Dades kasbahs. */
const lozenges = (xs: number[], y: number, r: number) =>
  xs.map((x) => `M${x} ${y - r} l${r} ${r} l${-r} ${r} l${-r} ${-r} Z`).join("");
/** A carved zigzag band. */
const zigzag = (x0: number, x1: number, y: number, step: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x + step <= x1 + 0.01; x += step) d += ` l${step / 2} ${-step * 0.7} l${step / 2} ${step * 0.7}`;
  return d;
};

const LOZENGES = lozenges([140, 160, 180, 200, 220, 240, 260], 140, 8);
const ZIGZAG = zigzag(132, 268, 166, 12.36);
/** Tall blind niches below the bands: the arcade that crowns every kasbah tower. */
const NICHES = doorRow([136, 160, 184, 208, 232, 256], 250, 12, 56);
const CORNICES = "M124 122 H276 M127 176 H273 M131 258 H269 M136 364 H264";
/** Small chamber windows on the lower tiers, deep set in the thick wall. */
const WINDOWS_UPPER = "M142 330 v-20 h16 v20 M192 330 v-20 h16 v20 M242 330 v-20 h16 v20";
const CHAMBER = door(132, 402, 18, 30);
const WINDOW_RIGHT = door(250, 402, 18, 30);
/** The carved plaque set in the wall above the gate: the rules, written down. */
const PLAQUE = "M172 298 H228 A6 6 0 0 1 234 304 V346 A6 6 0 0 1 228 352 H172 A6 6 0 0 1 166 346 V304 A6 6 0 0 1 172 298 Z";
const PLAQUE_LINES = "M176 312 H224 M176 322 H224 M176 332 H212 M176 342 H224";
/** The great gate and its patterned frame, where the keeper sits. */
const GATE = door(170, GROUND, 60, 110);
const GATE_FRAME = door(160, GROUND, 80, 126);
const KEEPER = "M200 489 V506 M200 494 L192 502 M200 494 L208 502 M200 506 L194 520 M200 506 L206 520 M213 482 V520";
/** A lower wing to the left, and a palm in the courtyard to the right. */
const WING = `M20 ${GROUND} V404 H108 V${GROUND} Z`;
const WING_PARAPET = merlons(20, 100, 404, 10);
const WING_WINDOWS = doorRow([38, 68], 476, 14, 26);
const PALM_TRUNK = `M344 ${GROUND} C350 470 346 430 336 392`;
const PALM_FRONDS =
  "M336 392 C318 388 304 396 292 410 M336 392 C354 386 372 392 386 406 M336 392 C324 376 312 372 298 374 M336 392 C348 376 364 372 380 376 M336 392 C336 376 332 362 322 352 M336 392 C340 376 346 364 358 356";

/**
 * The igudar story as one interactive line drawing of an old Moroccan kasbah: the shared tower, one chamber,
 * the keeper at the gate and the carved plaque with the written rules. `active` lights one region and slides a
 * ring to its number. Decoration for the four cards beside it: aria-hidden, no information the cards do not say.
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
      <svg viewBox="0 0 400 560" focusable="false" className="mx-auto h-auto w-full" role="presentation">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5D18E9" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Ground */}
        <path d={`M12 ${GROUND} H388`} stroke="currentColor" strokeWidth={DETAIL} className="text-foreground/25" />

        {/* Quiet drawing: the whole kasbah in ink, thin lines. */}
        <g className="text-foreground/35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d={WING} strokeWidth={STROKE} fill={`url(#${gradId})`} />
          <path d={WING_PARAPET} strokeWidth={STROKE} />
          <path d={WING_WINDOWS} strokeWidth={STROKE} />
          <path d="M24 430 H98" strokeWidth={DETAIL} strokeDasharray="3 5" />

          <path d={TOWER} fill={`url(#${gradId})`} strokeWidth={STROKE} />
          <g strokeWidth={STROKE}>
            <path d={PINNACLES} />
            <path d={PARAPET} />
            <path d={NICHES} />
            <path d={WINDOWS_UPPER} />
            <path d={CHAMBER} />
            <path d={WINDOW_RIGHT} />
            <path d={GATE} />
            <path d={PLAQUE} />
          </g>
          <g strokeWidth={DETAIL}>
            <path d={LOZENGES} />
            <path d={ZIGZAG} />
            <path d={CORNICES} />
            <path d={GATE_FRAME} strokeDasharray="2 4" />
            <path d={PLAQUE_LINES} strokeDasharray="3 5" />
            <path d="M126 196 H274 M129 230 H271" strokeDasharray="3 5" />
          </g>

          <path d={PALM_TRUNK} strokeWidth={STROKE} />
          <path d={PALM_FRONDS} strokeWidth={DETAIL} />
        </g>

        {/* Lit regions: violet strokes over the same shapes, faded in and out by `active`. */}
        <motion.g
          data-region="building"
          data-active={lit("building")}
          initial={false}
          animate={fadeTo("building")}
          transition={ease}
          className="fill-accent stroke-primary"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={TOWER} fillOpacity={0.55} />
          <path d={PINNACLES} fill="none" />
          <path d={PARAPET} fill="none" />
          <path d={LOZENGES} fill="none" strokeWidth={DETAIL} />
          <path d={ZIGZAG} fill="none" strokeWidth={DETAIL} />
          <path d={NICHES} fill="none" strokeWidth={DETAIL} />
        </motion.g>

        <motion.g
          data-region="chamber"
          data-active={lit("chamber")}
          initial={false}
          animate={fadeTo("chamber")}
          transition={ease}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={CHAMBER} />
          <path d="M124 402 H158 M124 372 H158" fill="none" strokeDasharray="3 5" strokeWidth={DETAIL} />
        </motion.g>

        <motion.g
          data-region="keeper"
          data-active={lit("keeper")}
          initial={false}
          animate={fadeTo("keeper")}
          transition={ease}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={GATE} />
          <path d={GATE_FRAME} fill="none" strokeDasharray="2 4" strokeWidth={DETAIL} />
          <circle cx={200} cy={484} r={5} className="fill-primary" />
          <path d={KEEPER} fill="none" strokeWidth={1.6} />
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
          <path d={PLAQUE} />
          <path d={PLAQUE_LINES} fill="none" strokeWidth={DETAIL} />
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
