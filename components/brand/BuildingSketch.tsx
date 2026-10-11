import { useId } from "react";
import { cn } from "@/lib/utils";

export type BuildingSketchVariant = "agadir" | "arch" | "riad";

const VIEWBOX: Record<BuildingSketchVariant, string> = {
  agadir: "0 0 240 260",
  arch: "0 0 200 260",
  riad: "0 0 640 120",
};

// Hand-authored line drawings of Moroccan architecture. Decoration only: aria-hidden, no text,
// no raster. The strokes are currentColor, and the "glass" is a soft white-to-violet gradient fill.
const STROKE = 1.2;
const DETAIL = 1;

/** Horseshoe-ish chamber door: a rectangle topped by a half circle, bottom at `bottom`. */
const door = (x: number, bottom: number, w: number, h: number) =>
  `M${x} ${bottom} V${bottom - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${bottom - h + w / 2} V${bottom}`;

/** Pointed crenellations ("dents") along a parapet at height y. */
const merlons = (x0: number, x1: number, y: number, step: number) => {
  let d = "";
  for (let x = x0; x + step <= x1 + 0.01; x += step) d += `M${x} ${y} l${step / 2} ${-step * 0.8} l${step / 2} ${step * 0.8}`;
  return d;
};

/** A row of evenly spaced chamber doors. */
const doorRow = (xs: number[], bottom: number, w: number, h: number) => xs.map((x) => door(x, bottom, w, h)).join("");

function Agadir({ fill }: { fill: string }) {
  // A stepped, tapering granary tower: stacked tiers of small chambers, protruding beam ends,
  // a crenellated crown and one great gate at the foot.
  const body = "M44 244 L52 170 L60 170 L62 118 L74 118 L76 66 L164 66 L166 118 L178 118 L180 170 L188 170 L196 244 Z";
  return (
    <>
      <path d={body} fill={fill} stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <g fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path d="M76 66 V54 H90 V66 M104 66 V54 H118 V66 M122 66 V54 H136 V66 M150 66 V54 H164 V66" />
        <path d="M30 244 H210" />
        <path d={doorRow([84, 106, 128, 150], 106, 12, 22)} />
        <path d={doorRow([74, 98, 122, 146], 160, 14, 26)} />
        <path d={doorRow([64, 90, 116, 142, 168], 214, 14, 28)} />
        <path d={door(104, 244, 32, 52)} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={DETAIL} strokeLinecap="round">
        <path d="M62 118 H178 M52 170 H188" />
        <path d="M78 84 H162 M78 96 H162" strokeDasharray="3 5" />
        <path d="M70 134 H170 M66 148 H174" strokeDasharray="3 5" />
        <path d="M60 188 H180 M56 200 H184 M52 222 H188" strokeDasharray="3 5" />
        <path d="M60 118 l-6 0 M180 118 l6 0 M50 170 l-6 0 M190 170 l6 0" />
      </g>
    </>
  );
}

function Arch({ fill }: { fill: string }) {
  // A pointed arch with two concentric moulding lines and a small star at the apex.
  const outer = "M28 250 V122 C28 76 78 48 100 14 C122 48 172 76 172 122 V250 Z";
  return (
    <>
      <path d={outer} fill={fill} stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <g fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 250 V126 C44 88 84 64 100 38 C116 64 156 88 156 126 V250" />
        <path d="M60 250 V130 C60 100 90 80 100 62 C110 80 140 100 140 130 V250" />
        <path d="M14 250 H186" />
        <path d="M100 98 l8 8 l-8 8 l-8 -8 Z" strokeWidth={DETAIL} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={DETAIL} strokeLinecap="round">
        <path d="M28 224 H60 M140 224 H172 M28 198 H44 M156 198 H172" />
        <path d="M100 4 V10" />
        <path d="M76 250 V150 M124 250 V150" strokeDasharray="3 5" />
      </g>
    </>
  );
}

function Riad({ fill }: { fill: string }) {
  // A courtyard-house skyline: low wings with pointed parapets, a central pavilion under a
  // pyramidal tiled roof, arched openings.
  const wings = "M16 108 V66 H228 V108 Z M412 108 V66 H624 V108 Z";
  const pavilion = "M236 108 V58 H404 V108 Z";
  return (
    <>
      <path d={wings} fill={fill} stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={pavilion} fill={fill} stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <g fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 108 H634" />
        <path d={merlons(16, 228, 66, 14)} />
        <path d={merlons(412, 624, 66, 14)} />
        <path d="M228 58 L320 14 L412 58 Z" fill={fill} />
        <path d="M320 14 V4" />
        <path d={doorRow([40, 76, 112, 148, 184], 108, 18, 28)} />
        <path d={doorRow([436, 472, 508, 544, 580], 108, 18, 28)} />
        <path d={door(300, 108, 40, 62)} />
        <path d={doorRow([254, 368], 108, 18, 30)} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={DETAIL} strokeLinecap="round">
        <path d="M268 58 L320 28 L372 58 M250 58 L320 20 M390 58 L320 20" />
        <path d="M16 78 H228 M412 78 H624" strokeDasharray="3 5" />
        <path d="M296 80 H344 M320 62 V80" />
      </g>
    </>
  );
}

/**
 * Light, glassy line drawings of Moroccan architecture used as catchy corner decoration:
 * an agadir (collective granary tower), a pointed arch and a riad roofline.
 * Stroke 1-1.25, currentColor at 14 % opacity. Never place it behind text or numbers.
 */
export function BuildingSketch({ variant, className }: { variant: BuildingSketchVariant; className?: string }) {
  const gradId = `sketch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fill = `url(#${gradId})`;
  return (
    <div
      aria-hidden="true"
      data-building-sketch={variant}
      className={cn("pointer-events-none select-none text-primary opacity-[0.14]", className)}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={VIEWBOX[variant]}
        className="h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#5D18E9" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {variant === "agadir" && <Agadir fill={fill} />}
        {variant === "arch" && <Arch fill={fill} />}
        {variant === "riad" && <Riad fill={fill} />}
      </svg>
    </div>
  );
}
