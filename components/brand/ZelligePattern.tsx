import { useId } from "react";

/** 16-point polygon: two overlapping squares make an 8-point star (khatam geometry). */
function star(cx: number, cy: number, R: number) {
  const r = R * 0.765;
  return Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/**
 * Zellige line texture (seed from the design system, section 5.1). Monochrome via
 * currentColor: always use it at 4 to 7 % opacity with a gradient mask, and never
 * behind numbers, body text, forms, tables or charts.
 * The platform's refined version replaces this one.
 */
export function ZelligePattern({
  size = 48,
  strokeWidth = 1,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const id = useId();
  const s = size;
  const R = s * 0.35;
  const centres = [
    [s / 2, s / 2],
    [0, 0],
    [s, 0],
    [0, s],
    [s, s],
  ];
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          {centres.map(([x, y], i) => (
            <polygon
              key={i}
              points={star(x, y, R)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
