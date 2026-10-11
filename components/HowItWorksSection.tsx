"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, DoorClosed, ScrollText, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import AnimatedSection from "@/components/AnimatedSection";
import DirhamPath from "@/components/DirhamPath";
import WalletIllustration from "@/components/WalletIllustration";
import { BuildingSketch, GranarySketch } from "@/components/brand";
import { Hover, Reveal } from "@/components/motion";

// Each idea is the approved text, split at its own sentence boundary: the story of the granary, then
// what it means in IGUDAR. Nothing is added or reworded.
const pillars = [
  {
    icon: Building2,
    title: "One shared building",
    story:
      "The igudar were the Amazigh collective granaries: one strong building that many families raised and guarded together.",
    inIgudar: "A property bought through IGUDAR works the same way. One building, many owners.",
  },
  {
    icon: DoorClosed,
    title: "Your own chamber",
    story: "Each family kept its own chamber, marked and remembered.",
    inIgudar:
      "You hold shares of the company that owns the property, a defined and recorded part, never an unwritten promise.",
  },
  {
    icon: ShieldCheck,
    title: "A trusted keeper",
    story: "A granary needed a keeper everyone trusted.",
    inIgudar:
      "Here, a regulated bank holds your money in escrow, and a professional operator rents and looks after the property.",
  },
  {
    icon: ScrollText,
    title: "Rules written down",
    story: "Everyone agreed the rules before the first harvest.",
    inIgudar:
      "Ours are written in the shareholders' agreement, and the fee grid is published in full, the same for everyone.",
  },
];

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="how-it-works" className="relative isolate overflow-hidden scroll-mt-28 bg-surface-mist px-0 pb-12 pt-24 lg:pb-16 lg:pt-32">
      {/* Decoration only: placed in the free margins either side of the centred heading. */}
      <BuildingSketch variant="arch" className="absolute left-4 top-10 -z-10 hidden h-64 w-48 xl:block 2xl:left-16" />
      <BuildingSketch variant="agadir" className="absolute right-4 top-8 -z-10 hidden h-72 w-60 -scale-x-100 xl:block 2xl:right-16" />
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

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <Reveal className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6">
              <GranarySketch active={active} onSelect={setActive} className="mx-auto max-w-lg" />
            </div>
          </Reveal>

          <div>
            {/* Phones step through the four ideas; desktop reads them all and hovers. */}
            <div
              role="tablist"
              aria-label="The four ideas"
              className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
            >
              {pillars.map((p, i) => (
                <button
                  key={p.title}
                  role="tab"
                  type="button"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={`min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    active === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="mr-1.5 opacity-70">{i + 1}</span>
                  {p.title}
                </button>
              ))}
            </div>

            <ul className="grid gap-4">
              {pillars.map(({ icon: Icon, title, story, inIgudar }, i) => (
                <li key={title} className={active === i ? "block" : "hidden lg:block"}>
                  <Reveal index={i}>
                    <Hover>
                      <article
                        tabIndex={0}
                        data-pillar={i}
                        data-active={active === i}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className="relative rounded-3xl border border-border bg-card p-6 outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {active === i && (
                          <motion.span
                            layoutId="pillar-ring"
                            aria-hidden="true"
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
                            className="pointer-events-none absolute -inset-px rounded-3xl border-2 border-primary/60"
                          />
                        )}
                        <div className="flex items-start gap-4">
                          <span
                            data-pillar-icon=""
                            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"
                          >
                            <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              <span className="mr-2 text-sm font-semibold text-primary">{i + 1}</span>
                              {title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story}</p>
                          </div>
                        </div>
                        <div data-in-igudar="" className="mt-4 rounded-2xl bg-accent/60 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">In IGUDAR</p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground">{inIgudar}</p>
                        </div>
                      </article>
                    </Hover>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

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
            <DirhamPath className="mb-5 px-2" />
            <WalletIllustration />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
