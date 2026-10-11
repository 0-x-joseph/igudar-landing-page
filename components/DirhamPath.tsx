"use client";

import { DrawPath } from "@/components/motion";

const STOPS = [
  { label: "Your bank", x: 66.7 },
  { label: "Escrow", x: 200 },
  { label: "The building", x: 333.3 },
];

/**
 * The route of one dirham in a single stroke: bank, escrow, building, and the way back. It draws itself
 * the first time it is scrolled into view and stands finished under reduced motion. The full flow with
 * its refund branch is in "How your money moves"; this is only the line that ties the wallet to it.
 */
export default function DirhamPath({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <ol className="grid grid-cols-3 text-center text-xs font-semibold text-foreground">
        {STOPS.map((s, i) => (
          <li key={s.label}>
            <span className="mr-1.5 text-primary">{i + 1}</span>
            {s.label}
          </li>
        ))}
      </ol>
      <svg
        data-dirham-path=""
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 64"
        className="mt-2 h-auto w-full text-primary"
        role="presentation"
      >
        <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <DrawPath d="M66.7 14 H200" delay={0} duration={0.7} />
          <DrawPath d="M200 14 H333.3" delay={0.6} duration={0.7} />
          <DrawPath d="M333.3 22 C333.3 66 66.7 66 66.7 24" delay={1.3} duration={1} strokeOpacity={0.55} />
          <DrawPath d="M61 31 L66.7 22 L72.4 31" delay={2.2} duration={0.3} strokeOpacity={0.55} />
        </g>
        {STOPS.map((s) => (
          <circle key={s.label} cx={s.x} cy={14} r={5} className="fill-card stroke-primary" strokeWidth={1.6} />
        ))}
      </svg>
    </div>
  );
}
