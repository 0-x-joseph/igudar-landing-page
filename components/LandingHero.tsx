"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { LIMITS, formatMad, simulate, yieldLabel } from "@/lib/finance";
import { ArchFrame, TifinaghMark, ZelligePattern } from "@/components/brand";

// Engine output at the minimum ticket: labelled, never a bare percentage.
const BASE_YIELD = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" }).netCashYieldYear1;

const ctaPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ctaSecondary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function LandingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-background px-5 pb-12 pt-32 sm:px-6 sm:pt-40 lg:pb-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        <div>
          {/* The zellige texture lives behind the headline only, never behind the body text below. */}
          <div className="relative">
            <ZelligePattern className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 h-[calc(100%+6rem)] w-[calc(100%+5rem)] text-primary opacity-[0.06] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]" />
            <TifinaghMark height={20} className="mb-6 text-primary" />
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-display text-[clamp(2.75rem,7.2vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-foreground"
            >
              Real property. Real rent.{" "}
              <span className="mt-1 block italic text-primary">Clear rules.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Own real, rented Moroccan property alongside professionals, from{" "}
            {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          >
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="https://app.igudar.tech/auth/login" className={ctaPrimary}>
                Access the demo
              </a>
              <a href="#waitlist-cta" className={ctaSecondary}>
                Join the waitlist
              </a>
            </div>
            <p className="financial-number mt-8 w-fit max-w-full rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
              {yieldLabel(BASE_YIELD, "base")}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none"
        >
          <ArchFrame className="aspect-[4/5] w-full bg-accent">
            <Image
              src="/images/hero-bg.png"
              alt="Aerial view of a Moroccan city at dusk"
              fill
              priority
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 384px, 320px"
              className="object-cover object-[30%_35%]"
            />
          </ArchFrame>
        </motion.div>
      </div>
    </section>
  );
}
