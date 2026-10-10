import { cn } from "@/lib/utils";

export interface TifinaghMarkProps {
  className?: string;
  /** Rendered height in px. Width follows the aspect ratio. Default 24. */
  height?: number;
}

// Drawn from the glyph strip under the IGUDAR wordmark (public/igudar.png), traced as centre-lines
// in the logo's own geometry: a three-stroke sigma, an X under a heavy bar, a stacked pair of small
// rings, a lambda, one small ring and one large ring. Coordinates are in the logo's enlarged
// crop space; the viewBox frames the strip.
const VIEW = { x: 55, y: 45, w: 1565, h: 345 };
const STROKE = 34;

type Letter = { name: string; paths?: string[]; circles?: Array<[number, number, number]> };

const LETTERS: Letter[] = [
  { name: "yi", paths: ["M262 80 L82 148 L232 215 L82 288 L262 358"] },
  { name: "yg", paths: ["M342 80 H580", "M358 90 L562 366", "M566 90 L352 366"] },
  { name: "yu", circles: [[700, 115, 42], [700, 325, 42]] },
  { name: "yd", paths: ["M830 372 L940 88 L1050 372"] },
  { name: "ya", circles: [[1175, 325, 42]] },
  { name: "yr", circles: [[1445, 218, 150]] },
];

/** The IGUDAR Tifinagh glyphs as inline SVG. Decorative accent only; never functional text. */
export function TifinaghMark({ className, height = 24 }: TifinaghMarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      height={height}
      width={(height * VIEW.w) / VIEW.h}
      className={cn("shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="butt"
      strokeLinejoin="bevel"
    >
      {LETTERS.map((l) => (
        <g key={l.name} data-letter={l.name}>
          {l.paths?.map((d) => <path key={d} d={d} />)}
          {l.circles?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
        </g>
      ))}
    </svg>
  );
}
