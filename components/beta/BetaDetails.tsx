import { Clock, Database, FlaskConical, Wallet } from "lucide-react";
import { LIMITS, formatMad } from "@/lib/finance";
import AnimatedSection from "@/components/AnimatedSection";

const facts = [
  {
    icon: FlaskConical,
    title: "A closed test",
    body: "About 50 people, let in by hand. A founder approves every account before you get in.",
  },
  {
    icon: Wallet,
    title: "Demo money only",
    body: "Every subscription uses demo money. No real money is collected or moved, anywhere in the beta.",
  },
  {
    icon: Clock,
    title: "Time can run faster",
    body: "The simulation may run faster than real time: up to a year of activity in about two weeks. You will always see which mode is on.",
  },
];

const steps = [
  { title: "Explore properties", body: "Read the documents, the fees and the risks of each demo property." },
  {
    title: "Simulate subscriptions",
    body: `Subscribe with demo money, from ${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} per property, and see where it sits.`,
  },
  { title: "Receive simulated distributions", body: "Watch simulated rent arrive, net of fees and taxes, as the clock moves." },
  { title: "Tell us what works", body: "Say what was clear, what was confusing and what you would change." },
];

export default function BetaDetails() {
  return (
    <>
      <section id="what" className="scroll-mt-28 px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              What the beta <span className="italic text-primary">is</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A small, honest test of the real platform. We want to see whether the rules, the numbers and the screens
              make sense to the people they are built for, before anything is offered to the public.
            </p>
          </AnimatedSection>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {facts.map(({ icon: Icon, title, body }, i) => (
              <li key={title}>
                <AnimatedSection delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </AnimatedSection>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="who" className="scroll-mt-28 px-5 pb-20 sm:px-6 lg:pb-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Who it is <span className="italic text-primary">for</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Urban professionals in Morocco and Moroccans abroad who are curious about owning a share of a rented
              building, and who want to read the rules before any real money is involved.
            </p>

            <h3 className="mt-10 flex items-center gap-3 text-lg font-semibold text-foreground">
              <Database className="size-5 text-primary" strokeWidth={1.7} aria-hidden="true" />
              What we collect, and why
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              To learn what works, we record how you use the beta (usage events) and the feedback you give us. No
              identity documents are stored. Your data is handled under Moroccan personal-data law (Law 09-08), overseen
              by the CNDP. You will see a consent screen before you start.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              What you will <span className="italic text-primary">do</span>
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="financial-number flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
