import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import MoneyFlowDiagram from "@/components/MoneyFlowDiagram";
import FeeGridTable from "@/components/FeeGridTable";

const timeline = [
  { when: "Day 0", what: `You commit. A ${LIMITS.COOLING_OFF_DAYS}-day cooling-off period applies.` },
  { when: "Raise closes", what: "If the target is reached, escrow releases the funds to the property company." },
  { when: `From year ${LIMITS.EXIT_LOCK_YEARS}`, what: `Exit windows open every ${LIMITS.EXIT_WINDOW_MONTHS} months.` },
  { when: `About year ${LIMITS.HOLD_YEARS}`, what: "The property is sold, or sold in a block." },
];

/** "How your money moves": escrow diagram, timeline and the public fee grid. */
export default function HowYourMoneyMoves() {
  return (
    <section id="how-your-money-moves" className="scroll-mt-28 bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold text-primary">How your money moves</p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From your bank account to the building, and back
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Your money is never mixed with ours. It waits in an escrow account until the raise succeeds, and goes back to
            you in full if it does not.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-background p-4 sm:p-8">
          <MoneyFlowDiagram />
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t) => (
            <li key={t.when} className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-bold text-foreground">{t.when}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.what}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20">
          <div className="mb-6 max-w-2xl">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              The fee grid: who pays what, and when
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              The same for every investor, published in full. Sellers and operators pay their own fees; they never reduce
              your return.
            </p>
          </div>
          <FeeGridTable />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
            <Link href="/calculator" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-2 hover:underline">
              Work out your own share in the calculator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/simulator" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-2 hover:underline">
              Open the simulator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
