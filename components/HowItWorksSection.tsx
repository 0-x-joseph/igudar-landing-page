import Link from "next/link";
import { Building2, DoorClosed, ScrollText, ShieldCheck } from "lucide-react";

import AnimatedSection from "@/components/AnimatedSection";
import WalletIllustration from "@/components/WalletIllustration";

const pillars = [
  {
    icon: Building2,
    title: "One shared building",
    text: "The igudar were the Amazigh collective granaries: one strong building that many families raised and guarded together. A property bought through IGUDAR works the same way. One building, many owners.",
  },
  {
    icon: DoorClosed,
    title: "Your own chamber",
    text: "Each family kept its own chamber, marked and remembered. You hold shares of the company that owns the property, a defined and recorded part, never an unwritten promise.",
  },
  {
    icon: ShieldCheck,
    title: "A trusted keeper",
    text: "A granary needed a keeper everyone trusted. Here, a regulated bank holds your money in escrow, and a professional operator rents and looks after the property.",
  },
  {
    icon: ScrollText,
    title: "Rules written down",
    text: "Everyone agreed the rules before the first harvest. Ours are written in the shareholders' agreement, and the fee grid is published in full, the same for everyone.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-28 px-0 pb-12 pt-24 lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold text-primary">How it works</p>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              An old idea, built for today
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              IGUDAR is named after the igudar, the collective granaries of the Amazigh. The same four ideas hold up the
              platform.
            </p>
          </div>
        </AnimatedSection>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <AnimatedSection delay={i * 90} className="h-full">
                <div className="h-full rounded-3xl border border-border bg-card p-6">
                  <span className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ul>

        <div className="mt-24 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Follow every dirham
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Your wallet shows four things: what you committed, what sits in escrow, what is invested in the property
              company, and the rent you have actually received. Nothing hidden, nothing to guess.
            </p>
            <Link
              href="/simulator"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Simulate your own amount
            </Link>
          </AnimatedSection>
          <AnimatedSection delay={120}>
            <WalletIllustration />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
