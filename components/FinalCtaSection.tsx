"use client";

import { useState } from "react";
import { LIMITS, formatMad } from "@/lib/finance";
import AnimatedSection from "@/components/AnimatedSection";
import WaitlistModal from "@/components/WaitlistModal";
import { BuildingSketch, ReactivePattern } from "@/components/brand";

// The closed-beta sign-up. Approval is manual.
const BETA_URL = "https://app.igudar.tech/auth/register";

export default function FinalCtaSection() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <section id="waitlist-cta" className="scroll-mt-24 bg-background px-5 py-24 sm:px-6 lg:py-32">
      <ReactivePattern className="mx-auto max-w-5xl rounded-[2.5rem] border border-border bg-card px-6 py-14 sm:px-12 lg:py-20">
        {/* Decoration only, kept to the card's side margins and foot, never behind the text. */}
        <BuildingSketch variant="arch" className="absolute -left-12 bottom-0 hidden h-56 w-32 lg:block" />
        <BuildingSketch variant="arch" className="absolute -right-12 bottom-0 hidden h-56 w-32 -scale-x-100 lg:block" />
        <BuildingSketch
          variant="riad"
          className="absolute inset-x-0 bottom-0 mx-auto hidden h-10 w-[26rem] max-w-full min-[420px]:block"
        />
        <div className="mx-auto max-w-3xl text-center min-[420px]:pb-14">
          <AnimatedSection>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Stop watching from the sidelines.{" "}
              <span className="italic text-primary">Start with a simulation.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              See what {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} could look like, try the closed beta with
              demo money, or join the waitlist to hear when IGUDAR opens.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={BETA_URL}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 sm:w-auto text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Apply for beta
              </a>
              <button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="inline-flex min-h-12 w-full cursor-pointer items-center sm:w-auto justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Join the waitlist
              </button>
            </div>
          </AnimatedSection>
        </div>
      </ReactivePattern>
      <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </section>
  );
}
