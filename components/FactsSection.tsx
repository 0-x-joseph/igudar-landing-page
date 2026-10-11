import Link from "next/link";
import { ArrowRight, CalendarClock, Ticket, BadgePercent, type LucideIcon } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { MadCount } from "@/components/MadCount";
import { Hover } from "@/components/motion";
import { ReactiveGlow } from "@/components/brand";
import { FEE_GRID, LIMITS, formatMad, formatPercent } from "@/lib/finance";

// Three facts read straight from the fee grid and the legal constants. No investor counts, no track record.
const facts: { icon: LucideIcon; figure: string; count?: number; label: string; note: string }[] = [
  {
    icon: Ticket,
    figure: formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 }),
    count: LIMITS.MIN_TICKET_MAD,
    label: "Minimum ticket",
    note: `Per project, in steps of ${formatMad(LIMITS.TICKET_STEP_MAD, { decimals: 0 })}.`,
  },
  {
    icon: BadgePercent,
    figure: formatPercent(FEE_GRID.D1_ENTRY, 0),
    label: "Entry fee",
    note: "Subscribing costs nothing. The full fee grid is published.",
  },
  {
    icon: CalendarClock,
    figure: `Every ${LIMITS.EXIT_WINDOW_MONTHS} months`,
    label: "Organised exit windows",
    note: `Open after ${LIMITS.EXIT_LOCK_YEARS} year of holding.`,
  },
];

export default function FactsSection() {
  return (
    <section aria-labelledby="facts-title" className="group relative isolate overflow-hidden bg-surface-mist px-5 py-24 sm:px-6 lg:py-32">
      <ReactiveGlow className="inset-0" />
      <div className="relative mx-auto max-w-6xl">
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

        <ul className="mt-16 grid gap-4 md:grid-cols-3 md:gap-6">
          {facts.map((f, i) => (
            <li key={f.label} className="h-full">
              <AnimatedSection delay={i * 80} className="h-full">
                <Hover className="h-full">
                <div
                  data-fact-card=""
                  className="flex h-full flex-col items-center rounded-3xl border border-primary/15 bg-card p-8 text-center shadow-[0_1px_0_rgb(93_24_233/0.06)]"
                >
                  <span
                    data-fact-icon=""
                    className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary"
                  >
                    <f.icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <p
                    data-fact-figure=""
                    className="financial-number mt-6 text-4xl font-bold tracking-tight text-primary md:text-3xl lg:text-[2.5rem]"
                  >
                    {f.count !== undefined ? <MadCount value={f.count} /> : f.figure}
                  </p>
                  <p className="mt-3 text-base font-semibold text-foreground">{f.label}</p>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{f.note}</p>
                </div>
                </Hover>
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
