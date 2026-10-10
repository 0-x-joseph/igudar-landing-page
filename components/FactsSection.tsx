import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { FEE_GRID, LIMITS, formatMad, formatPercent } from "@/lib/finance";

// Three facts read straight from the fee grid and the legal constants. No investor counts, no track record.
const facts = [
  {
    figure: formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 }),
    label: "Minimum ticket",
    note: `Per project, in steps of ${formatMad(LIMITS.TICKET_STEP_MAD, { decimals: 0 })}.`,
  },
  {
    figure: formatPercent(FEE_GRID.D1_ENTRY, 0),
    label: "Entry fee",
    note: "Subscribing costs nothing. The full fee grid is published.",
  },
  {
    figure: `Every ${LIMITS.EXIT_WINDOW_MONTHS} months`,
    label: "Organised exit windows",
    note: `Open after ${LIMITS.EXIT_LOCK_YEARS} year of holding.`,
  },
];

export default function FactsSection() {
  return (
    <section aria-labelledby="facts-title" className="px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">The facts</p>
            <h2
              id="facts-title"
              className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Three things to know before anything else
            </h2>
          </div>
        </AnimatedSection>

        <ul className="mt-16 grid gap-10 text-center md:grid-cols-3 md:gap-6">
          {facts.map((f, i) => (
            <li key={f.label}>
              <AnimatedSection delay={i * 80}>
                <div className="flex flex-col items-center">
                  <p className="financial-number text-4xl font-bold tracking-tight text-foreground md:text-3xl lg:text-[2.75rem]">
                    {f.figure}
                  </p>
                  <p className="mt-3 text-base font-semibold text-foreground">{f.label}</p>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{f.note}</p>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <Link
            href="/pricing"
            className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            See who pays what, when
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
