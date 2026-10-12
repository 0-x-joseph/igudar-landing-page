"use client";

import { useTranslations } from "next-intl";

import { DrawPath } from "@/components/motion";

const STOPS = [
  { id: "bank", x: 66.7 },
  { id: "escrow", x: 200 },
  { id: "building", x: 333.3 },
] as const;

/**
 * The route of one dirham in a single stroke: bank, escrow, building, and the way back. It draws itself
 * the first time it is scrolled into view and stands finished under reduced motion. The full flow with
 * its refund branch is in "How your money moves"; this is only the line that ties the wallet to it.
 * The stroke has no text; it is mirrored in right-to-left pages so the return arrow still ends at the bank.
 */
export default function DirhamPath({ className = "" }: { className?: string }) {
  const t = useTranslations("sections.dirhamPath");
  return (
    <div className={className}>
      <ol className="grid grid-cols-3 text-center text-xs font-semibold text-foreground">
        {STOPS.map((s, i) => (
          <li key={s.id}>
            <span className="me-1.5 text-primary">{i + 1}</span>
            {t(`stops.${s.id}`)}
          </li>
        ))}
      </ol>
      <svg
        data-dirham-path=""
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 64"
        className="mt-2 h-auto w-full text-primary rtl:-scale-x-100"
        role="presentation"
      >
        <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <DrawPath d="M66.7 14 H200" delay={0} duration={0.7} />
          <DrawPath d="M200 14 H333.3" delay={0.6} duration={0.7} />
          <DrawPath d="M333.3 22 C333.3 66 66.7 66 66.7 24" delay={1.3} duration={1} strokeOpacity={0.55} />
          <DrawPath d="M61 31 L66.7 22 L72.4 31" delay={2.2} duration={0.3} strokeOpacity={0.55} />
        </g>
        {STOPS.map((s) => (
          <circle key={s.id} cx={s.x} cy={14} r={5} className="fill-card stroke-primary" strokeWidth={1.6} />
        ))}
      </svg>
    </div>
  );
}
