"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LIMITS, formatMad, simulate, yieldLabel } from "@/lib/finance";

// Engine output at the minimum ticket: labelled, never a bare percentage.
const BASE_YIELD = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" }).netCashYieldYear1;

const wealthTerms = ["estate", "trust", "transparency"];

export default function LandingHero() {
  const [activeTerm, setActiveTerm] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveTerm((current) => (current + 1) % wealthTerms.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section className="relative isolate overflow-hidden bg-background px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(93,24,233,0.14),transparent_35%),linear-gradient(180deg,#F7F5EF_0%,#FFFFFF_70%)]" />

      <div className="mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="mx-auto mt-7 max-w-5xl text-center text-[clamp(3rem,8vw,7rem)] font-black leading-[0.88] tracking-[-0.07em] text-foreground"
        >
          Build your wealth through real 
          <span className="relative mx-auto mt-2 block h-[0.95em] w-full overflow-hidden text-primary">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={wealthTerms[activeTerm]}
                initial={reduceMotion ? false : { opacity: 0, y: "70%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: "-70%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {wealthTerms[activeTerm]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Own real, rented Moroccan property alongside professionals, from{" "}
          {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}.
        </motion.p>

        {/* <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="#waitlist"
            className="rounded-full bg-primary px-7 py-4 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-accent-foreground"
          >
            Join the waitlist
          </Link>

          <Link
            href="#how-it-works"
            className="rounded-full border border-border bg-card px-7 py-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-muted/50"
          >
            See how it works
          </Link>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="mx-auto mt-8 max-w-md"
        >
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
  <button
    className="
      group relative overflow-hidden
      rounded-2xl bg-primary
      px-8 py-4
      text-base font-semibold text-white
      shadow-[0_10px_40px_rgba(93,24,233,0.35)]
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-[0_20px_60px_rgba(93,24,233,0.5)]
      active:translate-y-0
    "
		type="button"
		onClick={() => {
		  window.location.href = "https://app.igudar.tech/auth/login";
		}}
  >
    <span className="relative z-10">
      Access MVP
    </span>

    <div
      className="
        absolute inset-0
        bg-gradient-to-r
        from-[#6D28FF]
        via-[#7C3AED]
        to-primary
        opacity-0
        transition-opacity duration-300
        group-hover:opacity-100
      "
    />
  </button>

  <button
    type="button"
    onClick={() => {
      document
        .getElementById("waitlist-cta")
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }}
    className="
      rounded-2xl
      border border-border
      bg-white/70
      backdrop-blur-xl
      px-8 py-4
      text-base font-semibold text-foreground
      transition-all duration-300
      hover:-translate-y-1
      hover:border-primary/40
      hover:bg-card
      hover:shadow-xl
    "
  >
    Join Waitlist
  </button>
</div>
          <p className="financial-number mx-auto mt-6 w-fit max-w-full rounded-full border border-border bg-card px-4 py-2 text-center text-sm font-medium text-foreground">
            {yieldLabel(BASE_YIELD, "base")}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
