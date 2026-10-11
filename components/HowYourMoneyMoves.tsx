import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import MoneyFlowDiagram from "@/components/MoneyFlowDiagram";
import { ReactiveGlow } from "@/components/brand";

const linkClass =
  "inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const timeline = [
  { when: "Day 0", what: `You commit. A ${LIMITS.COOLING_OFF_DAYS}-day cooling-off period applies.` },
  { when: "Raise closes", what: "If the target is reached, escrow releases the funds to the property company." },
  { when: `From year ${LIMITS.EXIT_LOCK_YEARS}`, what: `Exit windows open every ${LIMITS.EXIT_WINDOW_MONTHS} months.` },
  { when: `About year ${LIMITS.HOLD_YEARS}`, what: "The property is sold, or sold in a block." },
];

/** "How your money moves": escrow diagram, timeline and the public fee grid. */
export default function HowYourMoneyMoves() {
  return (
    <section id="how-your-money-moves" className="group relative isolate scroll-mt-28 overflow-hidden pb-24 pt-12 lg:pb-32 lg:pt-16">
      <ReactiveGlow className="inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold text-primary">How your money moves</p>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            From your bank account to the building, and back
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Your money is never mixed with ours. It waits in an escrow account until the raise succeeds, and goes back to
            you in full if it does not.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-8">
          <MoneyFlowDiagram />
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t) => (
            <li key={t.when} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold text-foreground">{t.when}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.what}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 rounded-3xl border border-border bg-card p-6 sm:p-10">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            The fee grid: who pays what, and when
          </h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            The same for every investor, published in full. Sellers and operators pay their own fees; they never reduce
            your return.
          </p>
          <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:gap-8">
            <Link href="/pricing" className={linkClass}>
              See the full fee grid
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/calculator" className={linkClass}>
              Work out your own share in the calculator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/simulator" className={linkClass}>
              Open the simulator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
