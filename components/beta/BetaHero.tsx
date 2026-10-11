import { LIMITS, formatMad } from "@/lib/finance";
import { ReactiveGlow, RosetteProgress, TifinaghMark } from "@/components/brand";

const ctaPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ctaTertiary =
  "inline-flex min-h-12 items-center justify-center px-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function BetaHero() {
  return (
    <section className="group relative isolate overflow-hidden px-5 pb-16 pt-36 sm:px-6 sm:pt-44 lg:pb-24">
      <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
        <div>
          <TifinaghMark height={20} className="text-primary" />
          <p className="mt-6 text-sm font-semibold text-primary">Closed beta</p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[1.02] tracking-tight text-foreground">
            Try IGUDAR with <span className="italic text-primary">demo money.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            We are testing the platform with about 50 people. Explore properties, simulate a subscription from{" "}
            {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} and tell us what works. No real money is involved.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a href="#apply" className={ctaPrimary}>
              Apply for the beta
            </a>
            <a href="#what" className={ctaTertiary}>
              What the beta is
            </a>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-xs justify-center rounded-3xl border border-border bg-card p-8 lg:max-w-none">
          <RosetteProgress
            steps={8}
            completed={8}
            size={176}
            label="Demo money. Nothing real at stake."
            className="text-center text-sm font-medium text-foreground"
          />
        </div>
      </div>
    </section>
  );
}
