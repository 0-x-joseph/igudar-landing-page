import { LIMITS, formatMad } from "@/lib/finance";
import { ReactiveGlow, RosetteProgress } from "@/components/brand";
import { Reveal } from "./Reveal";

const ctaPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ctaTertiary =
  "inline-flex min-h-12 items-center justify-center px-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const steps = [
  { title: "Apply", body: "A minute, a few questions." },
  { title: "A founder approves by hand", body: "Every application is read by a person." },
  { title: "You get the email with your access", body: "Then you create your account." },
];

export default function BetaHero() {
  return (
    <section className="group relative isolate overflow-hidden px-5 pb-16 pt-36 sm:px-6 sm:pt-44 lg:pb-24">
      <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <Reveal on="mount">
            <p className="text-sm font-semibold text-primary">Closed beta</p>
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
          </Reveal>

          <Reveal on="mount" delay={0.15}>
            <div className="mx-auto flex w-full max-w-xs justify-center rounded-3xl border border-border bg-card p-8 lg:max-w-none">
              <RosetteProgress
                steps={8}
                completed={8}
                size={176}
                label="Demo money. Nothing real at stake."
                className="text-center text-sm font-medium text-foreground"
              />
            </div>
          </Reveal>
        </div>

        <Reveal on="mount" delay={0.3}>
          <ol aria-label="How it works" className="mt-14 grid gap-3 md:grid-cols-3 md:gap-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card/80 p-4 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="financial-number flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold leading-snug text-foreground">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
