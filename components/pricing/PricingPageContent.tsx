import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FEE_GRID, TAX, formatMad, formatPercent } from "@/lib/finance";
import { ReactiveGlow, TifinaghMark, ZelligeBand } from "@/components/brand";
import AnimatedSection from "@/components/AnimatedSection";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import PricingTable, { EXAMPLE_TICKET_MAD } from "@/components/pricing/PricingTable";

const linkClass =
  "inline-flex min-h-12 items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** What the investor never pays: supply-side fees (S1, S2) and the entry fee (D1). Read from the grid. */
const notPaid = [
  {
    title: "Sellers pay the syndication fee",
    text: `${formatPercent(FEE_GRID.S1_SYNDICATION)} of the capital raised, charged to the seller or developer, and only if the raise closes.`,
  },
  {
    title: "Operators pay the structuring fee",
    text: `${formatPercent(FEE_GRID.S2_STRUCTURING)} of the capital raised, charged to the operator at lease signature.`,
  },
  {
    title: "No entry fee for you",
    text: `Subscribing costs ${formatPercent(FEE_GRID.D1_ENTRY, 0)}. If a raise fails, the escrow bank returns your money in full.`,
  },
];

export default function PricingPageContent() {
  return (
    <>
      <section className="group relative isolate overflow-hidden px-5 pb-16 pt-36 sm:px-6 lg:pb-24 lg:pt-44">
        <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
        <div className="mx-auto max-w-4xl text-center">
          <TifinaghMark height={22} className="mx-auto text-primary" />
          <p className="mt-6 text-sm font-semibold text-primary">Pricing</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Who pays what, when
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            One published fee grid, the same for every investor. No plans, no tiers, nothing to unlock.
          </p>
        </div>
      </section>

      <section aria-labelledby="fee-grid-title" className="relative isolate px-5 pb-20 sm:px-6 lg:pb-28">
        <ReactiveGlow className="inset-0" />
        <div className="mx-auto max-w-6xl">
          <h2 id="fee-grid-title" className="sr-only">
            The fee grid
          </h2>
          <PricingTable />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The last column is worked out for {formatMad(EXAMPLE_TICKET_MAD, { decimals: 0 })}, the minimum ticket. HT means
            before TVA; TTC includes the {formatPercent(TAX.TVA_ON_FEES, 0)} TVA that the property company cannot recover.
          </p>
        </div>
      </section>

      <ZelligeBand className="mx-auto max-w-4xl" />

      <section aria-labelledby="not-paid-title" className="relative isolate px-5 py-20 sm:px-6 lg:py-28">
        <ReactiveGlow className="inset-0" />
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2
              id="not-paid-title"
              className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              What you don&apos;t pay
            </h2>
          </AnimatedSection>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {notPaid.map((item) => (
              <li key={item.title} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Seller and operator fees never reduce your return. Fees are a disclosed service charge, never netted against
            a promised yield.
          </p>
        </div>
      </section>

      <section className="relative isolate px-5 pb-24 sm:px-6 lg:pb-32">
        <ReactiveGlow className="inset-0" />
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            See it on your own amount
          </h2>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
            <Link href="/calculator" className={linkClass}>
              Work out your own share in the calculator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/faq" className={linkClass}>
              Read the FAQ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <IndicativeNotice className="text-left" />
        </div>
      </section>
    </>
  );
}
