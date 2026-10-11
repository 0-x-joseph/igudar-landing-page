import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Original 8-fold star-and-cross line construction (khatam geometry).
 *
 * Construction on a square tile of side `s`:
 * - 8-point stars (two squares rotated 45 degrees, circumradius R = s*sqrt(2)/4)
 *   sit at the tile centre and the four corners. R is chosen so that stars touch
 *   tip to tip along the diagonals: the lattice reads as one continuous web.
 * - At the four edge midpoints the axis-aligned tips of the four neighbouring
 *   stars point at each other and leave a small cross-shaped void. A lozenge
 *   whose vertices land exactly on those four tips closes the void (the "saft"
 *   connector), so stars are linked by crosses rather than floating in space.
 * Everything is 1px line work in `currentColor`.
 */
const INNER_RATIO = Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8); // ~0.765

const fmt = (n: number) => n.toFixed(2);

function star(cx: number, cy: number, R: number) {
  const r = R * INNER_RATIO;
  return Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${fmt(cx + rad * Math.cos(a))},${fmt(cy + rad * Math.sin(a))}`;
  }).join(" ");
}

function lozenge(cx: number, cy: number, d: number) {
  return `${fmt(cx)},${fmt(cy - d)} ${fmt(cx + d)},${fmt(cy)} ${fmt(cx)},${fmt(cy + d)} ${fmt(cx - d)},${fmt(cy)}`;
}

const safeId = (raw: string) => `zellige-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;

/** Default treatment: faint violet, masked so it dissolves away from the top-right corner. */
export const ZELLIGE_CORNER_CLASS =
  "pointer-events-none absolute inset-0 text-primary opacity-[0.07] [mask-image:radial-gradient(circle_at_top_right,black,transparent_78%)] rtl:[mask-image:radial-gradient(circle_at_top_left,black,transparent_70%)]";

export interface ZelligePatternProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const geometryCache = new Map<number, { stars: string[]; crosses: string[] }>();

function geometry(s: number) {
  const cached = geometryCache.get(s);
  if (cached) return cached;
  const R = (s * Math.SQRT2) / 4;
  const d = s / 2 - R; // distance from a tile-edge midpoint to the nearest star tip
  const starCentres: Array<[number, number]> = [[s / 2, s / 2], [0, 0], [s, 0], [0, s], [s, s]];
  const crossCentres: Array<[number, number]> = [[s / 2, 0], [0, s / 2], [s, s / 2], [s / 2, s]];
  const built = {
    stars: starCentres.map(([x, y]) => star(x, y, R)),
    crosses: crossCentres.map(([x, y]) => lozenge(x, y, d)),
  };
  geometryCache.set(s, built);
  return built;
}

function Tile({ id, size, strokeWidth }: { id: string; size: number; strokeWidth: number }) {
  const s = size;
  const { stars, crosses } = geometry(s);
  const common = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinejoin: "miter" as const };
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      {stars.map((points, i) => <polygon key={`s${i}`} points={points} {...common} />)}
      {crosses.map((points, i) => <polygon key={`c${i}`} points={points} {...common} />)}
    </pattern>
  );
}

/**
 * Decorative zellige texture. Use only masked, at 4-7 % opacity;
 * never behind body text, forms, tables or charts.
 */
export function ZelligePattern({ size = 48, strokeWidth = 1, className }: ZelligePatternProps) {
  const id = safeId(useId());
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="100%" height="100%">
      <defs><Tile id={id} size={size} strokeWidth={strokeWidth} /></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** One row of tiles, 24px tall, faded at both ends. For dividers and the property-card funding band. */
export function ZelligeBand({ strokeWidth = 1, className }: { strokeWidth?: number; className?: string }) {
  const id = safeId(useId());
  return (
    <div
      aria-hidden="true"
      data-zellige-band=""
      className={cn(
        "pointer-events-none h-6 w-full text-primary opacity-[0.12] [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]",
        className,
      )}
    >
      <svg aria-hidden="true" focusable="false" width="100%" height="24">
        <defs><Tile id={id} size={24} strokeWidth={strokeWidth} /></defs>
        <rect width="100%" height="24" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
